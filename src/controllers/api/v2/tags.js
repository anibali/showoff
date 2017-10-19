const express = require('express');
const Mapper = require('jsonapi-mapper');
const Joi = require('joi');
const _ = require('lodash');

const models = require('../../../models');

const mapper = new Mapper.Bookshelf();

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({ error: 'not found' });
  } else {
    res.status(500).json({ error: 'internal server error' });
  }
};

const tagDataSchema = Joi.object().keys({
  type: Joi.string().valid(['tags']),
  attributes: Joi.object().keys({
    name: Joi.string(),
  }),
  relationships: Joi.object().keys({
    notebook: Joi.object().keys({
      data: Joi.object().keys({
        type: Joi.string().valid(['notebooks']),
        id: Joi.string().regex(/^[0-9]+$/, 'numbers'),
      })
    })
  }),
});

const postTagSchema = Joi.object().keys({
  data: tagDataSchema,
});

// GET /api/v2/tags
const indexTags = (req, res) => {
  models('Tag').fetchJsonApi({ include: ['notebook'] })
    .then(tags => res.json(mapper.map(tags, 'tags', {
      enableLinks: false,
      attributes: { omit: ['id', 'notebookId'] },
      relations: { included: false },
    })))
    .catch(err => errorResponse(res, err));
};

// POST /api/v2/tags
const createTag = (req, res) => {
  Joi.validate(req.body, postTagSchema, { presence: 'required' })
    .then(body =>
      models('Notebook')
        .where({ id: parseInt(body.data.relationships.notebook.data.id, 10) })
        .fetch({ require: true })
        .catch(() => { throw Error('invalid notebook ID'); })
        .then((notebook) => ({ body, notebook }))
    )
    .then(({ body, notebook }) => {
      return models('Tag').forge(
        _.assign({}, body.data.attributes, { notebookId: notebook.id })
      ).save()
        .then(tag => { tag.relations.notebook = notebook; return tag; })
        .then(tag => mapper.map(tag, 'tags', {
          enableLinks: false,
          attributes: { omit: ['id', 'notebookId'] },
          relations: { included: false },
        }))
        .then((tagsJson) => res.status(201).json(tagsJson))
        .catch(err => errorResponse(res, err));
    })
    .catch((err) => res.status(400).json({ error: err.message }));
};

const router = express.Router();

router.route('/')
  .get(indexTags)
  .post(createTag);

module.exports = router;
