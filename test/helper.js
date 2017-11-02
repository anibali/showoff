// Use Babel to provide support for JSX
require('babel-core/register');

const { factory, BookshelfAdapter } = require('factory-girl');
const Must = require('must');
const mockWs = require('mock-socket');

const MustHttp = require('./mustHttp').default;
const fixtures = require('./fixtures');

const models = require('../src/models').default;
const app = require('../src/app').default;
const WebSocketServer = require('../src/webSocketServer').default;

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
    .then(() => {
      global.wss = new WebSocketServer(new mockWs.Server('ws://localhost:3000'));
    })
);

after(() => {
  server.close();
  return models.knex.destroy();
});
