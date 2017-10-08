// Use Babel to provide support for JSX
require('babel-core/register');

const { factory, BookshelfAdapter } = require('factory-girl');

const models = require('../src/models');

const adapter = new BookshelfAdapter();
factory.setAdapter(adapter);

const app = require('../src/app');

let server = null;

before((done) => {
  models.knex.migrate.latest()
    .then(() => new Promise((resolve) => {
      server = app.listen(3000, () => {
        resolve();
      });
    }))
    .then(() => done())
    .catch(done);
});

after((done) => {
  server.close();
  models.knex.destroy()
    .then(() => done())
    .catch(done);
});

factory.define('notebook', models('Notebook'), {
  title: factory.sequence('notebook.title', n => `Test notebook ${n}`),
  pinned: false,
});
