const express = require('express');
const _ = require('lodash');
const models = require('../models');
const wss = require('../websocket-server');
const frameViews = require('../frameViews');

const router = express.Router();

const errorResponse = (res, err) => {
  if(err.message === 'EmptyResponse') {
    res.status(404).json({});
  } else {
    res.status(500).json({});
  }
};

const notebookParams = (req) => _.pick(req.body.notebook, ['title']);

router.post('/notebook', (req, res) => {
  const attrs = notebookParams(req);

  models('Notebook').forge(attrs).save()
    .then((notebook) => res.json(notebook))
    .catch((err) => errorResponse(res, err));
});

router.delete('/notebook/:id/frames', (req, res) => {
  const notebookId = parseInt(req.params.id, 10);

  models('Frame').where({ notebookId }).destroy()
    .then(() => res.json({}))
    .catch((err) => errorResponse(res, err));
});

const frameParams = (req) => _.pick(req.body.frame, ['content', 'title']);

router.put('/frame/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const attrs = frameParams(req);

  models('Frame').where({ id }).fetch({ require: true })
    .then((frame) => frame.save(attrs))
    .then((frame) => {
      const newFrame = _.clone(frame.toJSON());
      const promise = frameViews.render(newFrame.content)
        .then((content) => {
          newFrame.content = content;
        })
        .then(() => newFrame);
      return promise;
    })
    .then((frame) => {
      wss.broadcast(JSON.stringify(frame));
      return frame;
    })
    .then((frame) => res.json(frame))
    .catch((err) => {
      errorResponse(res, err);
    });
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
