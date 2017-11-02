import expect from 'must';
import sinon from 'sinon';
import _ from 'lodash';
import { factory } from 'factory-girl';
import models from '../src/models';

describe('API V2 Tags', () => {
  let clock = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    return Promise.all([
      models('Tag').where('id', '!=', 0).destroy(),
      models('Notebook').where('id', '!=', 0).destroy(),
    ]);
  });

  afterEach(() => {
    clock.restore();
    return factory.cleanUp()
      .then(() => models.knex.raw('ALTER SEQUENCE tags_id_seq RESTART WITH 1;'))
      .then(() => models.knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'));
  });

  describe('GET /tags', () => {
    const sendRequest = () => fetch('http://localhost:3000/api/v2/tags');

    describe('when there are no tags in the database', () => {
      it('should return HTTP status 200', () =>
        expect(sendRequest()).to.eventually.have.status(200)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return an empty data array', () => {
        const expected = {
          data: []
        };

        return sendRequest()
          .then(res => res.json())
          .then(res => expect(res).to.eql(expected));
      });
    });

    describe('when there are two tags in the database', () => {
      beforeEach(() => factory.createMany('tag', 2));

      it('should return HTTP status 200', () =>
        expect(sendRequest()).to.eventually.have.status(200)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return all frames', () => {
        const expected = {
          data: [
            {
              type: 'tags',
              id: '1',
              attributes: {
                name: 'test-tag-1',
                createdAt: '1970-01-01T00:00:00.000Z',
                updatedAt: '1970-01-01T00:00:00.000Z',
              },
              relationships: {
                notebook: {
                  data: {
                    type: 'notebooks',
                    id: '1',
                  }
                }
              },
            },
            {
              type: 'tags',
              id: '2',
              attributes: {
                name: 'test-tag-2',
                createdAt: '1970-01-01T00:00:00.000Z',
                updatedAt: '1970-01-01T00:00:00.000Z',
              },
              relationships: {
                notebook: {
                  data: {
                    type: 'notebooks',
                    id: '2',
                  }
                }
              },
            },
          ]
        };

        return sendRequest()
          .then(res => res.json())
          .then(res => Object.assign({}, res, { data: _.sortBy(res.data, 'id') }))
          .then(res => expect(res).to.eql(expected));
      });
    });
  });

  describe('POST /tags', () => {
    const sendRequest = body => fetch('http://localhost:3000/api/v2/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    describe('when the request body is incorrectly structured JSON', () => {
      const reqBody = {
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

    describe('when the related notebook does not exist', () => {
      const reqBody = {
        data: {
          type: 'tags',
          attributes: {
            name: 'new-tag-1',
          },
          relationships: {
            notebook: {
              data: {
                type: 'notebooks',
                id: '1337',
              }
            }
          },
        }
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

    describe('when valid attributes for one tag are specified', () => {
      beforeEach(() =>
        factory.create('notebook', { id: 1 })
      );

      const reqBody = {
        data: {
          type: 'tags',
          attributes: {
            name: 'new-tag-1',
          },
          relationships: {
            notebook: {
              data: {
                type: 'notebooks',
                id: '1',
              }
            }
          },
        }
      };

      it('should return HTTP status 201', () =>
        expect(sendRequest(reqBody)).to.eventually.have.status(201)
      );

      it('should have JSON content type', () =>
        expect(sendRequest(reqBody)).to.eventually.have.jsonContent()
      );

      it('should return the new tags', () => {
        const expected = {
          data: {
            type: 'tags',
            id: '1',
            attributes: {
              name: 'new-tag-1',
              createdAt: '1970-01-01T00:00:00.000Z',
              updatedAt: '1970-01-01T00:00:00.000Z',
            },
            relationships: {
              notebook: {
                data: {
                  type: 'notebooks',
                  id: '1',
                }
              }
            },
          },
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
