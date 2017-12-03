import Router from 'express-promise-router';
import * as Mapper from 'jsonapi-mapper';
import Joi from 'joi';
import _ from 'lodash';
import httpErrors from 'http-errors';

import models from '../../../models';


const mapper = new Mapper.Bookshelf();

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
  meta: Joi.object().optional(),
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
const indexTags = (req, res) =>
  models('Tag').fetchJsonApi({ include: ['notebook'] })
    .then(tags => mapper.map(tags, 'tags', {
      enableLinks: false,
      attributes: { omit: ['id', 'notebookId'] },
      relations: { included: req.jsonApi.include },
    }))
    .then(tags => res.json(tags));

// POST /api/v2/tags
const createTag = (req, res) =>
  Joi.validate(req.body, postTagSchema, { presence: 'required' })
    .catch(err => { throw httpErrors.BadRequest(err.message); })
    .then((body) =>
      new Promise((resolve) => resolve(_.assign({}, body.data.attributes,
        { notebookId: parseInt(body.data.relationships.notebook.data.id, 10) })))
        .then(attrs => models('Tag').forge(attrs).save())
        .catch(err => { throw httpErrors.BadRequest(err.message); })
        .then(mapTagToJson)
        .then(tagJson => res.status(201).json(tagJson))
    );

const router = Router();

router.route('/')
  .get(indexTags)
  .post(createTag);

export default router;
