/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

const express = require('express');

const notebooksController = require('./notebooks');
const framesController = require('./frames');
const tagsController = require('./tags');


const router = express.Router();

router.use('/notebooks', notebooksController);
router.use('/frames', framesController);
router.use('/tags', tagsController);

module.exports = router;
