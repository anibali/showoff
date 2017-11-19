import expect from 'must';
import sinon from 'sinon';
import _ from 'lodash';
import axios from 'axios';
import { factory } from 'factory-girl';

import models from '../src/models';

describe('API V2 Tags', () => {
  let client = null;
  let clock = null;

  beforeEach(() => {
    client = axios.create({
      baseURL: 'http://localhost:3000/api/v2',
      auth: global.auth,
    });

    clock = sinon.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => {
    clock.restore();
    return factory.cleanUp()
      .then(() => models.knex.raw('ALTER SEQUENCE tags_id_seq RESTART WITH 1;'))
      .then(() => models.knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'));
  });

  describe('GET /tags', () => {
    const sendRequest = () => client.get('/tags');

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
          .then(res => res.data)
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
          .then(res => res.data)
          .then(res => Object.assign({}, res, { data: _.sortBy(res.data, 'id') }))
          .then(res => expect(res).to.eql(expected));
      });
    });
  });

  describe('POST /tags', () => {
    const sendRequest = body => client.post('http://localhost:3000/api/v2/tags', body);

    describe('when the request body is incorrectly structured JSON', () => {
      const reqBody = {
      };

      it('should return a status 400 error response', () =>
        expect(sendRequest(reqBody)).to.reject.with.errorResponse(400)
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

      it('should return a status 400 error response', () =>
        expect(sendRequest(reqBody)).to.reject.with.errorResponse(400)
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
          .then(res => res.data)
          .then((body) => {
            expect(body).to.eql(expected);
          });
      });
    });
  });
});
