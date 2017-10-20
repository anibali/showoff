const express = require('express');
const _ = require('lodash');
const Mapper = require('jsonapi-mapper');
const Joi = require('joi');
const escape = require('escape-html');

const models = require('../../../models');
const frameViews = require('../../../frameViews');

const mapper = new Mapper.Bookshelf();

const errorResponse = (res, err) => {
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

const renderFrames = (framesJson) => Promise.all(framesJson.map(renderFrame));

const postNotebookSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['notebooks']),
    attributes: Joi.object().keys({
      pinned: Joi.boolean().optional(),
      title: Joi.string(),
    }),
  }),
});

const patchNotebookSchema = Joi.object().keys({
  data: Joi.object().keys({
    type: Joi.string().valid(['notebooks']),
    id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
    attributes: Joi.object().keys({
      pinned: Joi.boolean().optional(),
      title: Joi.string().optional(),
    }),
  }),
});

// GET /api/v2/notebooks
const indexNotebooks = (req, res) =>
  models('Notebook').fetchAll()
    .then(notebooks => {
      res.json(mapper.map(notebooks, 'notebooks', { enableLinks: false }));
    })
    .catch(err => errorResponse(res, err));

// POST /api/v2/notebooks
const createNotebook = (req, res) =>
  Joi.validate(req.body, postNotebookSchema, { presence: 'required' })
    .then((body) =>
      new Promise((resolve) => resolve(body.data.attributes))
        .then(attrs => models('Notebook').forge(attrs).save())
        .then(notebook => res.status(201).json(
          mapper.map(notebook, 'notebooks', { enableLinks: false })))
        .catch(err => errorResponse(res, err))
    )
    .catch((err) => res.status(400).json({ error: err.message }));

// GET /api/v2/notebooks/104
const showNotebook = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then(id => models('Notebook').where({ id }).fetchJsonApi({ include: ['frames'], require: true }, false))
    .then(notebook => mapper.map(notebook, 'notebooks', { enableLinks: false }))
    .then(notebookJson =>
      renderFrames(_.filter(notebookJson.included, { type: 'frames' }))
        .then(framesJson => _.assign({}, notebookJson, {
          included: _.reject(notebookJson.included, { type: 'frames' }).concat(framesJson)
        })))
    .then(notebookJson => res.json(notebookJson))
    .catch(err => errorResponse(res, err));

// PATCH /api/v2/notebooks/104
const updateNotebook = (req, res) =>
  Joi.validate(req.body, patchNotebookSchema, { presence: 'required' })
    .then((body) => {
      const id = parseInt(req.params.id, 10);
      return models('Notebook').where({ id }).fetch({ require: true })
        .then(notebook => notebook.save(body.data.attributes))
        .then(notebook => res.json(mapper.map(notebook, 'notebooks', { enableLinks: false })))
        .catch(err => errorResponse(res, err));
    })
    .catch((err) => res.status(400).json({ error: err.message }));

// DELETE /api/v2/notebooks/50
const destroyNotebook = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then((id) => models('Notebook').where({ pinned: false, id }).destroy({ require: true })
      .then(() => res.status(204).send())
      .catch(err => {
        if(err.message.indexOf('No Rows Deleted') < 0) {
          throw err;
        }
        res.status(404).json({ error: 'notebook not found, or is pinned' });
      })
      .catch(err => errorResponse(res, err))
    );

// DELETE /api/v2/notebooks/2/frames
const destroyNotebookFrames = (req, res) =>
  new Promise(resolve => resolve(parseInt(req.params.id, 10)))
    .then((notebookId) => models('Frame').where({ notebookId }).destroy()
      .then(() => res.status(204).send())
      .catch((err) => errorResponse(res, err))
    );

const router = express.Router();

router.route('/')
  .get(indexNotebooks)
  .post(createNotebook);
router.route('/:id')
  .get(showNotebook)
  .patch(updateNotebook)
  .delete(destroyNotebook);
router.route('/:id/frames')
  .delete(destroyNotebookFrames);

module.exports = router;
