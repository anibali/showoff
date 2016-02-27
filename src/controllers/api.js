const express = require('express');
const _ = require('lodash');
const models = require('../models');

const router = express.Router();

const errorResponse = (res, err) => {
  if(err.message === 'EmptyResponse') {
    res.status(404).json({});
  } else {
    res.status(500).json({});
  }
};

const frameParams = (req) => {
  return _.pick(req.body.frame, ['content', 'title']);
};

router.put('/frame/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const attrs = frameParams(req);

  models('Frame').where({ id }).fetch({ require: true })
    .then((frame) => frame.save(attrs))
    .then((frame) => res.json(frame))
    .catch((err) => errorResponse(res, err));
});

router.post('/frame', (req, res) => {
  const notebookId = req.body.frame.notebookId;
  // TODO: Verify notebookId is valid
  const attrs = _.assign({},
    frameParams(req),
    { notebookId });

  models('Frame').forge(attrs).save()
    .then((frame) => res.json(frame))
    .catch((err) => errorResponse(res, err));
});

module.exports = router;
