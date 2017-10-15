// Use Babel to provide support for JSX
require('babel-core/register');

const { factory, BookshelfAdapter } = require('factory-girl');
const Must = require('must');
const MustHttp = require('./mustHttp');
const fixtures = require('./fixtures');

const models = require('../src/models');
const app = require('../src/app');

MustHttp.register(Must);

const adapter = new BookshelfAdapter();
factory.setAdapter(adapter);
fixtures(factory, models);

let server = null;

before(() =>
  models.knex.migrate.latest()
    .then(() => new Promise((resolve) => {
      server = app.listen(3000, () => {
        resolve();
      });
    }))
);

after(() => {
  server.close();
  return models.knex.destroy();
});
