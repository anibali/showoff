const { factory, BookshelfAdapter } = require('factory-girl');
const Must = require('must');
const mockWs = require('mock-socket');

const MustHttp = require('./mustHttp').default;
const fixtures = require('./fixtures');

const showoffConfig = require('../src/config/showoff').default;

// Overwrite upload directory location
showoffConfig.uploadDir = '/tmp/showofftest_uploads';

const models = require('../src/models').default;
const app = require('../src/app').default;
const WebSocketServer = require('../src/webSocketServer').default;

MustHttp.register(Must);

const adapter = new BookshelfAdapter();
factory.setAdapter(adapter);
fixtures(factory, models);

const modelNames = ['Notebook', 'Tag', 'Frame', 'File'];

const assertDatabaseEmpty = () => Promise.all(modelNames.map(modelName =>
  models(modelName).where('id', '!=', 0).count()
    .then(count => console.assert(parseInt(count, 10) === 0, `left-over data in DB for ${modelName}`))
));

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

afterEach(assertDatabaseEmpty);

after(() => {
  server.close();
  return models.knex.destroy();
});
