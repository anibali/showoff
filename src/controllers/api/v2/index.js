/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

const express = require('express');
const Mapper = require('jsonapi-mapper');

const models = require('../../../models');

const notebooksController = require('./notebooks');
const framesController = require('./frames');

const router = express.Router();

const mapper = new Mapper.Bookshelf();

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({ error: 'not found' });
  } else {
    res.status(500).json({ error: 'internal server error' });
  }
};

/*
GET /api/v2/tags/
*/
router.get('/tags', (req, res) => {
  models('Tag').fetchAll()
    .then(tags => mapper.map(tags, 'tags', { enableLinks: false }))
    .then(tagsJson => res.json(tagsJson))
    .catch(err => errorResponse(res, err));
});

router.use('/notebooks', notebooksController);
router.use('/frames', framesController);

module.exports = router;
