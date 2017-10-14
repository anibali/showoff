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
    const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks');

    it('should return HTTP status 200', () =>
      expect(sendRequest()).to.eventually.have.status(200)
    );

    it('should have JSON content type', () =>
      expect(sendRequest()).to.eventually.have.jsonContent()
    );

    it('should return all notebooks', () => {
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

      return factory.createMany('notebook', 2, { title: 'Test notebook', pinned: false })
        .then(() => sendRequest())
        .then(res => expect(res.json()).to.eventually.eql(expected));
    });
  });

  describe('POST /notebooks', () => {
    const sendRequest = body => fetch('http://localhost:3000/api/v2/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    describe('when the request body is incorrectly structured JSON', () => {
      const reqBody = {
        pinned: false,
        title: 'New notebook',
      };

      it('should return HTTP status 400', () =>
        expect(sendRequest(reqBody)).to.eventually.have.status(400)
      );

      it('should have JSON content type', () =>
        expect(sendRequest(reqBody)).to.eventually.have.jsonContent()
      );

      it('should return an error message', () =>
        expect(sendRequest(reqBody).then(res => res.json())).to.eventually.have.property('error')
      );
    });

    describe('when valid attributes are specified', () => {
      const reqBody = {
        data: {
          type: 'notebooks',
          attributes: {
            pinned: false,
            title: 'New notebook',
          },
        },
      };

      it('should return HTTP status 201', () =>
        expect(sendRequest(reqBody)).to.eventually.have.status(201)
      );

      it('should have JSON content type', () =>
        expect(sendRequest(reqBody)).to.eventually.have.jsonContent()
      );

      it('should create a new notebook record in the database', () =>
        sendRequest(reqBody)
          .then(() => models('Notebook').where({ id: 1 }).fetch())
          .then(notebook => expect(notebook).to.not.be.null())
      );

      it('should return the new notebook', () => {
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

        return sendRequest(reqBody)
          .then(res => res.json())
          .then((body) => {
            expect(body).to.eql(expected);
          });
      });
    });
  });
});
