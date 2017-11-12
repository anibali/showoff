import passport from 'passport';

import authController from '../controllers/authController';
import apiv1 from '../controllers/api/v1';
import apiv2 from '../controllers/api/v2';


const routes = {};

const authenticate = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
    return;
  }

  passport.authenticate(['local', 'basic'])(req, res, next);
};

routes.connect = (app) => {
  app.use('/auth', authController);
  app.use('/api', authenticate, apiv1);
  app.use('/api/v1', authenticate, apiv1);
  app.use('/api/v2', authenticate, apiv2);
};


export default routes;
