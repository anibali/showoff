const express = require('express');
const _ = require('lodash');

const serverState = require('../server-state');

const router = express.Router();

router.put('/notebook/:notebookId/frame/:frameId', (req, res) => {
  const notebookId = parseInt(req.params.notebookId, 10);
  const frameId = parseInt(req.params.frameId, 10);

  // TODO: Get correct notebook
  const notebook = serverState.notebooks[0];
  const frame = _.find(notebook.frames, { id: frameId });

  _.assign(frame, req.body.frame);

  res.json(frame);
});

module.exports = router;
