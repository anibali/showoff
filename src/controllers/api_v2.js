/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

const express = require('express');
const _ = require('lodash');
const Mapper = require('jsonapi-mapper');
const Joi = require('joi');

const models = require('../models');
const wss = require('../websocket-server');
const frameViews = require('../frameViews');

const router = express.Router();

const mapper = new Mapper.Bookshelf();

// TODO: It might be a good idea to cache rendered frame content in the DB

const postBodySchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['notebooks']),
    attributes: Joi.object().keys({
      pinned: Joi.boolean().optional(),
      title: Joi.string(),
    }),
  }),
});

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({});
  } else {
    res.status(500).json({});
  }
};

const renderFrame = (frameJson) =>
  frameViews
    .render(frameJson.attributes)
    .catch(err => `<p style="color: red;">
        Error rendering frame content (type = "${frameJson.attributes}")
      </p>
      <pre>${err}</pre>`)
    .then(renderedContent =>
      _.merge({}, frameJson, { attributes: { renderedContent } }));

const renderFrames = (framesJson) => Promise.all(framesJson.map(renderFrame));

const notebookParams = (rawAttrs) =>
  _.pick(rawAttrs, 'title', 'pinned');

/*
GET /api/v2/notebooks
*/
router.get('/notebooks', (req, res) => {
  models('Notebook').fetchAll()
    .then(notebooks => {
      res.json(mapper.map(notebooks, 'notebooks', { enableLinks: false }));
    })
    .catch(err => errorResponse(res, err));
});

/*
POST /api/v2/notebooks

Example request:

    {
      "data": {
        "type": "notebooks",
        "attributes": {"title": "Foo"}
      }
    }

Example response:

    {
      "data": {
        "attributes": {
          "title": "Foo"
        },
        "id": "104",
        "type": "notebooks"
      }
    }
*/
router.post('/notebooks', (req, res) => {
  Joi.validate(req.body, postBodySchema, { presence: 'required' })
    .then((body) =>
      new Promise((resolve) => resolve(notebookParams(body.data.attributes)))
        .then(attrs => models('Notebook').forge(attrs).save())
        .then(notebook => res.status(201).json(
          mapper.map(notebook, 'notebooks', { enableLinks: false })))
        .catch(err => errorResponse(res, err))
    )
    .catch((err) => res.status(400).json({ error: err.message }));
});

/*
PATCH /api/v2/notebooks/104

Example request:

    {
      "data": {
        "type": "notebooks",
        "attributes": {"title": "Bar"}
      }
    }
*/
router.patch('/notebooks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const attrs = notebookParams(req.body.data.attributes);

  models('Notebook').where({ id }).fetch({ require: true })
    .then(notebook => notebook.save(attrs))
    .then(notebook => res.json(mapper.map(notebook, 'notebooks', { enableLinks: false })))
    .catch(err => {
      errorResponse(res, err);
    });
});

/*
GET /api/v2/notebooks/104

Example response:

    {
      "data": {
        "attributes": {
          "title": "Foo"
        },
        "id": "104",
        "type": "notebooks"
        "relationships": {
          "frames": {
            "data": [{ "type": "frames", "id": "1" }]
          }
        },
        "included": [
          {
            "type": "frames",
            "id": "1",
            "attributes": { "title": "A frame" }
          }
        ]
      }
    }
*/
router.get('/notebooks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Notebook').where({ id })
    .fetchJsonApi({ include: ['frames'] }, false)
    .then(notebook => mapper.map(notebook, 'notebooks', { enableLinks: false }))
    .then(notebookJson =>
      renderFrames(_.filter(notebookJson.included, { type: 'frames' }))
        .then(framesJson => _.assign({}, notebookJson, {
          included: _.reject(notebookJson.included, { type: 'frames' }).concat(framesJson)
        })))
    .then(notebookJson => res.json(notebookJson))
    .catch(err => errorResponse(res, err));
});

/*
DELETE /api/v2/notebooks/50
*/
router.delete('/notebooks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Notebook').where({ pinned: false, id }).destroy({ require: true })
    .then(() => res.status(204).send())
    .catch(err => errorResponse(res, err));
});

/*
DELETE /api/v2/notebooks/2/frames
*/
router.delete('/notebooks/:id/frames', (req, res) => {
  const notebookId = parseInt(req.params.id, 10);

  models('Frame').where({ notebookId }).destroy()
    .then(() => res.status(204).send())
    .catch((err) => errorResponse(res, err));
});

const frameParams = (rawAttrs) =>
  _.pick(rawAttrs, 'title', 'type', 'content', 'x', 'y', 'width', 'height');

/*
GET /api/v2/frames
*/
router.get('/frames', (req, res) => {
  models('Frame').fetchAll()
    .then(frames => res.json(mapper.map(frames, 'frames', { enableLinks: false })))
    .catch(err => errorResponse(res, err));
});

/*
GET /api/v2/frames/1
*/
router.get('/frames/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id })
    .fetchJsonApi({}, false)
    .then(frame => mapper.map(frame, 'frames', { enableLinks: false }))
    .then(frameJson =>
      renderFrame(frameJson.data)
        .then(data => _.assign({}, frameJson, { data })))
    .then(frameJson => res.json(frameJson))
    .catch(err => errorResponse(res, err));
});

/*
PATCH /api/v2/frames/3
*/
// FIXME: Probably broken
router.patch('/frames/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const attrs = frameParams(req.body.data.attributes);

  models('Frame').where({ id }).fetch({ require: true })
    .then(frame => frame.save(attrs))
    .then(frame => {
      const newFrame = _.clone(frame.toJSON());
      const promise = frameViews.render(newFrame)
        .then(renderedContent => {
          newFrame.renderedContent = renderedContent;
        })
        .then(() => newFrame);
      return promise;
    })
    .then(frame => {
      const broadcastFrame = _.clone(frame);
      broadcastFrame.content = broadcastFrame.renderedContent;
      wss.broadcast(JSON.stringify(broadcastFrame));
      return frame;
    })
    .then(frame => mapper.map(frame, 'frames', { enableLinks: false }))
    .then(frameJson => res.json(frameJson))
    .catch(err => {
      errorResponse(res, err);
    });
});

/*
POST /api/v2/frames

Example request:

    {
      "data": {
        "type": "frames",
        "attributes": {"title": "A frame"},
        "relationships": {
          "notebook": {"id": "1"}
        }
      }
    }
*/
// FIXME: Broken
router.post('/frames', (req, res) => {
  const notebookId = parseInt(req.body.data.relationships.notebook.id, 10);

  models('Notebook').where({ id: notebookId }).fetch({ require: true })
    .then(() => {
      const attrs = _.assign({},
        frameParams(req.body.data.attributes),
        { notebookId });

      return models('Frame').forge(attrs).save();
    })
    .then(frame => {
      const newFrame = _.clone(frame.toJSON());
      const promise = frameViews.render(newFrame)
        .then(renderedContent => {
          newFrame.renderedContent = renderedContent;
        })
        .then(() => newFrame);
      return promise;
    })
    .then(frame => {
      const broadcastFrame = _.clone(frame);
      broadcastFrame.content = broadcastFrame.renderedContent;
      wss.broadcast(JSON.stringify(broadcastFrame));
      return frame;
    })
    .then(frame => mapper.map(frame, 'frames', { enableLinks: false }))
    .then(frameJson => res.json(frameJson))
    .catch(err => errorResponse(res, err));
});

/*
DELETE /api/v2/frames/3
*/
router.delete('/frames/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id }).destroy({ require: true })
    .then(() => res.status(204).send())
    .catch(err => errorResponse(res, err));
});

/*
GET /api/v2/tags/
*/
router.get('/tags', (req, res) => {
  models('Tag').fetchAll()
    .then(tags => mapper.map(tags, 'tags', { enableLinks: false }))
    .then(tagsJson => res.json(tagsJson))
    .catch(err => errorResponse(res, err));
});

module.exports = router;
