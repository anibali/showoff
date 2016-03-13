const express = require('express');
const _ = require('lodash');
const models = require('../models');
const wss = require('../websocket-server');
const frameViews = require('../frameViews');

const router = express.Router();

const errorResponse = (res, err) => {
  console.error(err.stack);
  if(err.message === 'EmptyResponse') {
    res.status(404).json({});
  } else {
    res.status(500).json({});
  }
};

const notebookParams = (req) =>
  _.pick(req.body.notebook, 'title');

router.get('/notebooks', (req, res) => {
  models('Notebook').fetchAll().then((notebooks) => {
    res.json({ notebooks: notebooks.toJSON() });
  }).catch((err) => errorResponse(res, err));
});

router.post('/notebook', (req, res) => {
  const attrs = notebookParams(req);

  models('Notebook').forge(attrs).save()
    .then((notebook) => res.json(notebook))
    .catch((err) => errorResponse(res, err));
});

router.get('/notebook/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Notebook').where({ id }).fetch({ require: true, withRelated: ['frames'] })
    .then((notebook) => {
      notebook = notebook.toJSON();
      const promises = [];

      const frames = notebook.frames.map((frame) => {
        const newFrame = _.clone(frame);
        promises.push(
          frameViews.render(frame).then((content) => {
            newFrame.content = content;
          })
        );
        return newFrame;
      });

      Promise.all(promises).then(() => {
        res.json({ notebook: _.assign({}, notebook, { frames }) });
      });
    })
    .catch((err) => errorResponse(res, err));
});

router.delete('/notebook/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  models('Notebook').where({ id }).destroy()
    .then(() => res.json({}))
    .catch((err) => errorResponse(res, err));
});

router.delete('/notebook/:id/frames', (req, res) => {
  const notebookId = parseInt(req.params.id, 10);

  models('Frame').where({ notebookId }).destroy()
    .then(() => res.json({}))
    .catch((err) => errorResponse(res, err));
});

const frameParams = (req) =>
  _.pick(req.body.frame, 'title', 'type', 'content');

router.put('/frame/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const attrs = frameParams(req);

  models('Frame').where({ id }).fetch({ require: true })
    .then((frame) => frame.save(attrs))
    .then((frame) => {
      const newFrame = _.clone(frame.toJSON());
      const promise = frameViews.render(newFrame)
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
