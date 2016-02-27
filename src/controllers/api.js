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

router.put('/frame/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const newAttrs = _.pick(req.body.frame, ['content', 'title']);

  models('Frame').where({ id }).fetch({ require: true })
    .then((frame) => frame.save(newAttrs))
    .then((frame) => res.json(frame))
    .catch((err) => errorResponse(res, err));
});

module.exports = router;
