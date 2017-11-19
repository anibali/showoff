import express from 'express';
import * as Mapper from 'jsonapi-mapper';
import _ from 'lodash';

import models from '../../../models';
import { createApiKey, destroyApiKeys } from '../../../helpers/authHelpers';


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

// GET /api/v2/users/current
const showCurrentUser = (req, res) => {
  Promise.resolve(req.user)
    .then(user => mapper.map(user, 'users', {
      enableLinks: false,
      attributes: { omit: ['id', 'passwordHash', 'passwordSalt'] },
    }))
    .then(user => res.json(user))
    .catch(err => errorResponse(res, err));
};

// GET /api/v2/users/current/apiKeys
const showCurrentUserApiKeys = (req, res) => {
  models('ApiKey').where({ userId: req.user.id }).fetchAll()
    .then(apiKeys => mapper.map(apiKeys, 'apiKeys', {
      enableLinks: false,
      attributes: { omit: ['id', 'userId'] },
    }))
    .then(apiKeys => res.json(apiKeys))
    .catch(err => errorResponse(res, err));
};

// POST /api/v2/users/current/apiKeys
const createCurrentUserApiKey = (req, res) => {
  createApiKey(req.user.id)
    .then(({ apiKey, secretKey }) => {
      apiKey.attributes.secretKey = secretKey;
      return apiKey;
    })
    .then((apiKey) =>
      mapper.map(apiKey, 'apiKeys', {
        enableLinks: false,
        attributes: { omit: ['id', 'userId'] },
      })
    )
    .then(apiKey => res.json(apiKey))
    .catch(err => errorResponse(res, err));
};

// DELETE /api/v2/users/current/apiKeys
const destroyCurrentUserApiKeys = (req, res) => {
  destroyApiKeys(req.user.id)
    .then(() => res.status(204).send())
    .catch(err => errorResponse(res, err));
};

// DELETE /api/v2/users/current/apiKeys/:id
const destroyCurrentUserApiKey = (req, res) => {
  models('ApiKey').where({ id: req.params.id, userId: req.user.id }).destroy({ require: true })
    .then(() => res.status(204).send())
    .catch(err => errorResponse(res, err));
};

const currentUserRouter = express.Router();

currentUserRouter.route('/')
  .get(showCurrentUser);
currentUserRouter.route('/apiKeys')
  .get(showCurrentUserApiKeys)
  .post(createCurrentUserApiKey)
  .delete(destroyCurrentUserApiKeys);
currentUserRouter.route('/apiKeys/:id')
  .delete(destroyCurrentUserApiKey);

const router = express.Router();

const forbidInternalUser = (req, res, next) => {
  if(!req.isAuthenticated() || req.user.get('username') === '_internal') {
    res.status(401).send('_internal user is forbidden here');
  }

  next();
};

router.use('/current', forbidInternalUser, currentUserRouter);


export default router;
