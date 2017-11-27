import passport from 'passport';

import authController from '../controllers/authController';
import apiv2 from '../controllers/api/v2';


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
};


export default routes;
