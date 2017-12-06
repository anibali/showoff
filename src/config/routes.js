import passport from 'passport';
import express from 'express';
import path from 'path';

import authController from '../controllers/authController';
import apiv2 from '../controllers/api/v2';
import showoffConfig from './showoff';


const routes = {};

const authenticate = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
    return;
  }

  passport.authenticate('basic')(req, res, next);
};

routes.connect = (app) => {
  app.use('/auth', authController);
  app.use('/api/v2', authenticate, apiv2);

  // Serve uploaded static files for notebooks
  app.use('/notebooks', authenticate,
    express.static(path.join(showoffConfig.uploadDir, 'notebooks')));
};


export default routes;
