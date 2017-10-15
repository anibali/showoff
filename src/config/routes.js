const apiv1 = require('../controllers/api/v1');
const apiv2 = require('../controllers/api/v2');

const routes = {};

routes.connect = (app) => {
  app.use('/api', apiv1);
  app.use('/api/v1', apiv1);
  app.use('/api/v2', apiv2);
};

module.exports = routes;
