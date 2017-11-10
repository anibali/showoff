import express from 'express';
import _ from 'lodash';
import * as Mapper from 'jsonapi-mapper';
import Joi from 'joi';
import escape from 'escape-html';
import models from '../../../models';
import frameViews from '../../../frameViews';

const mapper = new Mapper.Bookshelf();

// TODO: It might be a good idea to cache rendered frame content in the DB

const postFrameSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['frames']),
    attributes: Joi.object().keys({
      title: Joi.string(),
      type: Joi.string().optional(),
      content: Joi.object().optional(),
      height: Joi.number().optional(),
      width: Joi.number().optional(),
      x: Joi.number().optional(),
      y: Joi.number().optional(),
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
  meta: Joi.object().optional(),
});

const patchFrameSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['frames']),
    id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
    attributes: Joi.object().keys({
      title: Joi.string().optional(),
      type: Joi.string().optional(),
      content: Joi.object().optional(),
      height: Joi.number().optional(),
      width: Joi.number().optional(),
      x: Joi.number().optional(),
      y: Joi.number().optional(),
    }),
    relationships: Joi.object().optional().keys({
      notebook: Joi.object().keys({
        data: Joi.object().keys({
          type: Joi.string().valid(['notebooks']),
          id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
        })
      })
    }),
  }),
  meta: Joi.object().optional(),
});

const errorResponse = (res, err) => {
  if(err.message === 'EmptyResponse' || err.message.indexOf('No Rows Deleted') > -1) {
    res.status(404).json({ error: 'not found' });
  } else if(err.message.indexOf('violates foreign key constraint') > -1) {
    res.status(400).json({ error: 'invalid foreign key' });
  } else {
    console.error(err);
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

const mapFrameToJson = (frame) => {
  const frameJson = mapper.map(frame, 'frames', {
    enableLinks: false,
    attributes: { omit: ['id', 'notebookId'] },
    relations: { included: false },
  });
  frameJson.data.relationships = _.assign({}, frameJson.data.relationships, {
    notebook: { data: { type: 'notebooks', id: String(frame.attributes.notebookId) } }
  });
  return frameJson;
};

const broadcastFrame = (frame) => {
  const flatFrame = _.assign({}, frame.data.attributes, {
    id: frame.data.id,
    notebookId: frame.data.relationships.notebook.data.id,
    content: frame.data.attributes.renderedContent,
  });
  global.wss.fireFrameUpdate(flatFrame);
  return frame;
};

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
    .then((body) =>
      new Promise((resolve) => resolve(_.assign({}, body.data.attributes,
        { notebookId: parseInt(body.data.relationships.notebook.data.id, 10) })))
        .then(attrs => models('Frame').forge(attrs).save())
        .then(mapFrameToJson)
        .then(frame => renderFrame(frame.data)
          .then(renderedContent => _.assign({}, frame, { data: renderedContent })))
        .then(broadcastFrame)
        .then(frameJson => res.status(201).json(frameJson))
        .catch(err => errorResponse(res, err))
    )
    .catch((err) => res.status(400).json({ error: err.message }));
};

// GET /api/v2/frames/1
const showFrame = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').where({ id })
    .fetchJsonApi({ include: ['notebook'], require: true }, false)
    .then(frame => mapper.map(frame, 'frames', {
      enableLinks: false,
      attributes: { omit: ['id', 'notebookId'] },
      relations: { included: false },
    }))
    .then(frameJson =>
      renderFrame(frameJson.data)
        .then(data => _.assign({}, frameJson, { data })))
    .then(frameJson => res.json(frameJson))
    .catch(err => errorResponse(res, err));
};

// PATCH /api/v2/frames/3
const updateFrame = (req, res) => {
  Joi.validate(req.body, patchFrameSchema, { presence: 'required' })
    .then((body) => {
      const id = parseInt(req.params.id, 10);
      models('Frame').where({ id }).fetch({ require: true })
        .then(frame => frame.save(body.data.attributes))
        .then(mapFrameToJson)
        .then(frame => renderFrame(frame.data)
          .then(renderedContent => _.assign({}, frame, { data: renderedContent })))
        .then(broadcastFrame)
        .then(frameJson => res.json(frameJson))
        .catch(err => errorResponse(res, err));
    })
    .catch((err) => res.status(400).json({ error: err.message }));
};

// DELETE /api/v2/frames/3
const destroyFrame = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Frame').forge({ id }).destroy({ require: true })
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

export default router;
