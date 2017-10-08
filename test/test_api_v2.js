const expect = require('must');
const sinon = require('sinon');

const { factory } = require('factory-girl');

const models = require('../src/models');

let clock = null;

beforeEach((done) => {
  clock = sinon.useFakeTimers();
  models('Notebook').where('id', '!=', 0).destroy()
    .then(() => done())
    .catch(done);
});

afterEach((done) => {
  clock.restore();
  factory.cleanUp()
    .then(() => models.knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'))
    .then(() => done())
    .catch(done);
});

describe('API V2', () => {
  describe('GET /notebooks', () => {
    it('should return all notebooks', (done) => {
      const expected = {
        data: [
          {
            type: 'notebooks',
            id: '1',
            attributes: {
              pinned: false,
              title: 'Test notebook',
              createdAt: '1970-01-01T00:00:00.000Z',
              updatedAt: '1970-01-01T00:00:00.000Z',
            },
          },
          {
            type: 'notebooks',
            id: '2',
            attributes: {
              pinned: false,
              title: 'Test notebook',
              createdAt: '1970-01-01T00:00:00.000Z',
              updatedAt: '1970-01-01T00:00:00.000Z',
            },
          },
        ]
      };

      factory.createMany('notebook', 2, { title: 'Test notebook', pinned: false })
        .then(() => fetch('http://localhost:3000/api/v2/notebooks'))
        .then(res => {
          expect(res.ok).to.be.true();
          return res.json();
        })
        .then((body) => {
          expect(body).to.eql(expected);
        })
        .then(() => done())
        .catch(done);
    });
  });

  describe('POST /notebooks', () => {
    it('should create a new notebook record', (done) => {
      const expected = {
        data: {
          type: 'notebooks',
          id: '1',
          attributes: {
            pinned: false,
            title: 'New notebook',
            createdAt: '1970-01-01T00:00:00.000Z',
            updatedAt: '1970-01-01T00:00:00.000Z',
          }
        }
      };

      const reqBody = {
        data: {
          type: 'notebooks',
          attributes: {
            pinned: false,
            title: 'New notebook',
          },
        },
      };

      fetch('http://localhost:3000/api/v2/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
        .then(res => {
          expect(res.ok).to.be.true();
          return res.json();
        })
        .then((body) => {
          expect(body).to.eql(expected);
        })
        .then(() => models('Notebook').where({ id: 1 }).fetch())
        .then(notebook => expect(notebook).to.not.be.null())
        .then(() => done())
        .catch(done);
    });
  });
});
