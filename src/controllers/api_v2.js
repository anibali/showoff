/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

const express = require('express');
const _ = require('lodash');
const models = require('../models');
const wss = require('../websocket-server');
const frameViews = require('../frameViews');

const router = express.Router();

// TODO: It would be a much better idea to render the frame content on POST/PUT
// and store the result in the database.

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({});
  } else {
    res.status(500).json({});
  }
};

const singleNotebookToJson = notebook => ({
  type: 'notebooks',
  id: notebook.id.toString(),
  attributes: _.pick(notebook.toJSON ? notebook.toJSON() : notebook,
    'pinned', 'title', 'createdAt', 'updatedAt'),
});

const singleFrameToJson = frame => ({
  type: 'frames',
  id: frame.id.toString(),
  attributes: _.pick(frame.toJSON ? frame.toJSON() : frame,
    'title', 'type', 'content', 'x', 'y', 'width', 'height', 'createdAt',
    'updatedAt', 'renderedContent')
});

const notebookParams = (rawAttrs) =>
  _.pick(rawAttrs, 'title', 'pinned');

/*
GET /api/v2/notebooks
*/
router.get('/notebooks', (req, res) => {
  models('Notebook').fetchAll().then(notebooks => {
    res.json({
      data: notebooks.map(singleNotebookToJson)
    });
  }).catch(err => errorResponse(res, err));
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
  const attrs = notebookParams(req.body.data.attributes);

  models('Notebook').forge(attrs).save()
    .then(notebook => res.json({
      data: singleNotebookToJson(notebook)
    }))
    .catch(err => errorResponse(res, err));
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
    .then(notebook => res.json({
      data: singleNotebookToJson(notebook)
    }))
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
            "data": []
          }
        }
      }
    }
*/
router.get('/notebooks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Notebook').where({ id }).fetch({ require: true, withRelated: ['frames'] })
    .then((notebook) => {
      const promises = [];
      const relatedFrames = notebook.related('frames');

      relatedFrames.forEach(frame => {
        const frameJson = frame.toJSON();

        promises.push(
          frameViews
            .render(frameJson)
            .catch(err => `<p style="color: red;">
                Error rendering frame content (type = "${frameJson.type}")
              </p>
              <pre>${err}</pre>`
            )
        );
      });

      return Promise.all(promises).then(renderedContentArray => {
        const notebookJson = singleNotebookToJson(notebook);
        const framesJson = relatedFrames.map(singleFrameToJson);
        for(let i = 1; i < renderedContentArray.length; ++i) {
          framesJson[i].attributes.renderedContent = renderedContentArray[i];
        }
        notebookJson.relationships = { frames: { data: framesJson } };
        res.json({ data: notebookJson });
      });
    })
    .catch((err) => errorResponse(res, err));
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
GET /api/v2/frames/
*/
router.get('/frames', (req, res) => {
  models('Frame').fetchAll().then(frames => {
    res.json({
      data: frames.map(singleFrameToJson)
    });
  }).catch(err => errorResponse(res, err));
});

/*
GET /api/v2/frames/1
*/
router.get('/frames/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id }).fetch({ require: true })
    .then(frame => {
      res.json({
        data: singleFrameToJson(frame)
      });
    })
    .catch(err => errorResponse(res, err));
});

/*
PATCH /api/v2/frames/3
*/
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
    .then(frame => res.json({
      data: singleFrameToJson(frame)
    }))
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
    .then(frame => res.json({
      data: singleFrameToJson(frame)
    }))
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

module.exports = router;
