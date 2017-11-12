import authController from '../controllers/authController';
import apiv1 from '../controllers/api/v1';
import apiv2 from '../controllers/api/v2';

const routes = {};

routes.connect = (app) => {
  app.use('/auth', authController);
  app.use('/api', apiv1);
  app.use('/api/v1', apiv1);
  app.use('/api/v2', apiv2);
};

export default routes;
