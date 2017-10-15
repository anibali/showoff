const express = require('express');
const _ = require('lodash');
const Mapper = require('jsonapi-mapper');
const Joi = require('joi');
const escape = require('escape-html');

const models = require('../../../models');
const wss = require('../../../websocket-server');
const frameViews = require('../../../frameViews');

const mapper = new Mapper.Bookshelf();

// TODO: It might be a good idea to cache rendered frame content in the DB

const postFrameSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['frames']),
    attributes: Joi.object().keys({
      title: Joi.string(),
      type: Joi.string(),
      content: Joi.object(),
      height: Joi.number(),
      width: Joi.number(),
      x: Joi.number(),
      y: Joi.number(),
    }),
    relationships: Joi.object().keys({
      notebook: Joi.object().keys({
        data: Joi.object().keys({
          type: Joi.string().valid(['notebooks']),
          id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
        })
      })
    }),
  }),
});

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({ error: 'not found' });
  } else {
    res.status(500).json({ error: 'internal server error' });
  }
};

const renderFrame = (frameJson) =>
  frameViews
    .render(frameJson.attributes)
    .catch(err => `<p style="color: red;">
        Error rendering frame content.
      </p>
      <pre>${escape(err.message)}</pre>`)
    .then(renderedContent =>
      _.merge({}, frameJson, { attributes: { renderedContent } }));

// TODO: Remove this function
const frameParams = (rawAttrs) =>
  _.pick(rawAttrs, 'title', 'type', 'content', 'x', 'y', 'width', 'height');

// GET /api/v2/frames
const indexFrames = (req, res) => {
  models('Frame').fetchJsonApi({ include: ['notebook'] })
    .then(frames => res.json(mapper.map(frames, 'frames', {
      enableLinks: false,
      attributes: { omit: ['id', 'notebookId'] },
      relations: { included: false },
    })))
    .catch(err => errorResponse(res, err));
};

// POST /api/v2/frames
const createFrame = (req, res) => {
  Joi.validate(req.body, postFrameSchema, { presence: 'required' })
    .then(body =>
      models('Notebook')
        .where({ id: parseInt(body.data.relationships.notebook.data.id, 10) })
        .fetch({ require: true })
        .catch(() => { throw Error('invalid notebook ID'); })
        .then((notebook) => ({ body, notebook }))
    )
    .then(({ body, notebook }) =>
      new Promise((resolve) => resolve(_.assign({}, body.data.attributes,
        { notebookId: notebook.id })))
        .then(attrs => models('Frame').forge(attrs).save())
        .then(frame => { frame.relations.notebook = notebook; return frame; })
        .then(frame => frameViews.render(frame.toJSON())
          .then(renderedContent => _.merge(_.clone(frame), { attributes: { renderedContent } })))
        .then(frame => {
          const broadcastFrame = frame.toJSON();
          broadcastFrame.content = frame.attributes.renderedContent;
          wss.broadcast(JSON.stringify(broadcastFrame));
          return frame;
        })
        .then(frame => mapper.map(frame, 'frames', {
          enableLinks: false,
          attributes: { omit: ['id', 'notebookId'] },
          relations: { included: false },
        }))
        .then(frameJson => res.status(201).json(frameJson))
        .catch(err => errorResponse(res, err))
    )
    .catch((err) => res.status(400).json({ error: err.message }));
};

// GET /api/v2/frames/1
const showFrame = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id })
    .fetchJsonApi({}, false)
    .then(frame => mapper.map(frame, 'frames', { enableLinks: false }))
    .then(frameJson =>
      renderFrame(frameJson.data)
        .then(data => _.assign({}, frameJson, { data })))
    .then(frameJson => res.json(frameJson))
    .catch(err => errorResponse(res, err));
};

// PATCH /api/v2/frames/3
// FIXME: Probably broken
const updateFrame = (req, res) => {
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
};

// DELETE /api/v2/frames/3
const destroyFrame = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id }).destroy({ require: true })
    .then(() => res.status(204).send())
    .catch(err => errorResponse(res, err));
};

const router = express.Router();

router.route('/')
  .get(indexFrames)
  .post(createFrame);
router.route('/:id')
  .get(showFrame)
  .patch(updateFrame)
  .delete(destroyFrame);

module.exports = router;
