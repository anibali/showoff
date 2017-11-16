/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

import express from 'express';

import notebooksController from './notebooks';
import framesController from './frames';
import tagsController from './tags';
import usersController from './users';


const router = express.Router();

router.use('/notebooks', notebooksController);
router.use('/frames', framesController);
router.use('/tags', tagsController);
router.use('/users', usersController);

export default router;
