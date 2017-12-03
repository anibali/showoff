/**
 * This version of the API makes an attempt at following the specifications
 * at http://jsonapi.org/ (v1.0).
 */

import express from 'express';

import notebooksController from './notebooks';
import framesController from './frames';
import tagsController from './tags';
import usersController from './users';


const controllers = [
  ['/notebooks', notebooksController],
  ['/frames', framesController],
  ['/tags', tagsController],
  ['/users', usersController],
];

// Middleware for parsing JSON API query parameters
const parseJsonApiQuery = (req, res, next) => {
  req.jsonApi = {
    include: req.query.include ? req.query.include.split(',') : [],
  };

  next();
};

const handleErrors = (err, req, res, next) => {
  if(res.headersSent) {
    next(err);
    return;
  }
  if(err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
};

const router = express.Router();

router.use(parseJsonApiQuery);
controllers.forEach(([path, controller]) => {
  router.use(path, controller);
});
router.use(handleErrors);


export default router;
