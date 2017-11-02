import express from 'express';
import * as Mapper from 'jsonapi-mapper';
import Joi from 'joi';
import _ from 'lodash';
import models from '../../../models';

const mapper = new Mapper.Bookshelf();

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

const mapTagToJson = (tag) => {
  const tagJson = mapper.map(tag, 'tags', {
    enableLinks: false,
    attributes: { omit: ['id', 'notebookId'] },
    relations: { included: false },
  });
  tagJson.data.relationships = _.assign({}, tagJson.data.relationships, {
    notebook: { data: { type: 'notebooks', id: String(tag.attributes.notebookId) } }
  });
  return tagJson;
};

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
    .then((body) =>
      new Promise((resolve) => resolve(_.assign({}, body.data.attributes,
        { notebookId: parseInt(body.data.relationships.notebook.data.id, 10) })))
        .then(attrs => models('Tag').forge(attrs).save())
        .then(mapTagToJson)
        .then(tagJson => res.status(201).json(tagJson))
        .catch(err => errorResponse(res, err))
    )
    .catch((err) => res.status(400).json({ error: err.message }));
};

const router = express.Router();

router.route('/')
  .get(indexTags)
  .post(createTag);

export default router;
