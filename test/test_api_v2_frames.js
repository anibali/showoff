import expect from 'must';
import sinon from 'sinon';
import _ from 'lodash';
import axios from 'axios';
import { factory } from 'factory-girl';
import models from '../src/models';

describe('API V2 Frames', () => {
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
      .then(() => models.knex.raw('ALTER SEQUENCE frames_id_seq RESTART WITH 1;'))
      .then(() => models.knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'));
  });

  describe('GET /frames', () => {
    const sendRequest = () => client.get('http://localhost:3000/api/v2/frames');

    describe('when there are two frames in the database', () => {
      beforeEach(() => factory.createMany('frame', 2));

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
              type: 'frames',
              id: '1',
              attributes: {
                title: 'Test frame 1',
                type: 'text',
                content: { body: 'Lorem ipsum' },
                height: 600,
                width: 800,
                x: 0,
                y: 0,
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
              type: 'frames',
              id: '2',
              attributes: {
                title: 'Test frame 2',
                type: 'text',
                content: { body: 'Lorem ipsum' },
                height: 600,
                width: 800,
                x: 0,
                y: 0,
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

  describe('POST /frames', () => {
    let broadcastStub;

    beforeEach(() => {
      broadcastStub = sinon.stub(global.wss, 'broadcast');
    });

    afterEach(() => {
      broadcastStub.restore();
    });

    const sendRequest = body => client.post('http://localhost:3000/api/v2/frames', body);

    describe('when the request body is incorrectly structured JSON', () => {
      const reqBody = {};

      it('should return a status 400 error response', () =>
        expect(sendRequest(reqBody)).to.reject.with.errorResponse(400)
      );
    });

    describe('when the related notebook does not exist', () => {
      const reqBody = {
        data: {
          type: 'frames',
          attributes: {
            title: 'New frame',
            type: 'text',
            content: { body: 'Lorem ipsum' },
            height: 600,
            width: 800,
            x: 0,
            y: 0,
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

    describe('when valid attributes are specified', () => {
      beforeEach(() =>
        factory.create('notebook', { id: 1 })
      );

      const reqBody = {
        data: {
          type: 'frames',
          attributes: {
            title: 'New frame',
            type: 'text',
            content: { body: 'Lorem ipsum' },
            height: 600,
            width: 800,
            x: 0,
            y: 0,
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

      it('should create a new frame record in the database', () =>
        sendRequest(reqBody)
          .then(() => models('Frame').where({ id: 1 }).fetch())
          .then(frame => expect(frame).to.not.be.null())
      );

      it('should return the new frame', () => {
        const expected = {
          data: {
            type: 'frames',
            id: '1',
            attributes: {
              title: 'New frame',
              type: 'text',
              content: { body: 'Lorem ipsum' },
              height: 600,
              width: 800,
              x: 0,
              y: 0,
              renderedContent: '<pre>Lorem ipsum</pre>',
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

      it('should broadcast the new notebook with WebSockets', () =>
        sendRequest(reqBody).then(() => {
          expect(broadcastStub.getCall(0).args[0]).to.be.eql({
            type: 'notebooks/MODIFY_FRAME',
            payload: {
              frame: {
                id: '1',
                title: 'New frame',
                type: 'text',
                content: '<pre>Lorem ipsum</pre>',
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                renderedContent: '<pre>Lorem ipsum</pre>',
                notebookId: '1',
                createdAt: new Date('1970-01-01T00:00:00.000Z'),
                updatedAt: new Date('1970-01-01T00:00:00.000Z'),
              }
            }
          });
        })
      );
    });
  });

  describe('GET /frames/:id', () => {
    beforeEach(() => factory.create('frame', { id: 1 }));

    describe('when the frame does not exist', () => {
      const sendRequest = () => client.get('http://localhost:3000/api/v2/frames/1337');

      it('should return a status 404 error response', () =>
        expect(sendRequest()).to.reject.with.errorResponse(404)
      );
    });

    describe('when the frame exists', () => {
      const sendRequest = () => client.get('http://localhost:3000/api/v2/frames/1');

      it('should return HTTP status 200', () =>
        expect(sendRequest()).to.eventually.have.status(200)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return the frame', () => {
        const expected = {
          data: {
            type: 'frames',
            id: '1',
            attributes: {
              title: 'Test frame 1',
              type: 'text',
              content: { body: 'Lorem ipsum' },
              renderedContent: '<pre>Lorem ipsum</pre>',
              height: 600,
              width: 800,
              x: 0,
              y: 0,
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

        return sendRequest()
          .then(res => res.data)
          .then(res => expect(res).to.eql(expected));
      });
    });
  });

  describe('DELETE /frames/:id', () => {
    beforeEach(() => factory.create('frame', { id: 1 }));

    describe('when the frame does not exist', () => {
      const sendRequest = () => client.delete('http://localhost:3000/api/v2/frames/1337');

      it('should return a status 404 error response', () =>
        expect(sendRequest()).to.reject.with.errorResponse(404)
      );
    });

    describe('when the frame exists', () => {
      const sendRequest = () => client.delete('http://localhost:3000/api/v2/frames/1');

      it('should return HTTP status 204', () =>
        expect(sendRequest()).to.eventually.have.status(204)
      );
    });
  });

  describe('PATCH /frames/:id', () => {
    let broadcastStub;

    beforeEach(() => {
      broadcastStub = sinon.stub(global.wss, 'broadcast');
      return factory.create('frame', { id: 1 });
    });

    afterEach(() => {
      broadcastStub.restore();
    });

    const sendRequest = body => client.patch('http://localhost:3000/api/v2/frames/1', body);

    describe('when the request body is incorrectly structured JSON', () => {
      const reqBody = {
        title: 'Updated frame',
      };

      it('should return a status 400 error response', () =>
        expect(sendRequest(reqBody)).to.reject.with.errorResponse(400)
      );
    });

    describe('when valid attributes are specified', () => {
      const reqBody = {
        data: {
          type: 'frames',
          id: '1',
          attributes: {
            title: 'Updated frame',
          },
        },
      };

      it('should return HTTP status 200', () =>
        expect(sendRequest(reqBody)).to.eventually.have.status(200)
      );

      it('should have JSON content type', () =>
        expect(sendRequest(reqBody)).to.eventually.have.jsonContent()
      );

      it('should return the updated notebook', () => {
        const expected = {
          data: {
            type: 'frames',
            id: '1',
            attributes: {
              title: 'Updated frame',
              type: 'text',
              content: { body: 'Lorem ipsum' },
              renderedContent: '<pre>Lorem ipsum</pre>',
              height: 600,
              width: 800,
              x: 0,
              y: 0,
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
          }
        };

        return sendRequest(reqBody)
          .then(res => res.data)
          .then((body) => {
            expect(body).to.eql(expected);
          });
      });

      it('should broadcast the updated notebook with WebSockets', () =>
        sendRequest(reqBody).then(() => {
          expect(broadcastStub.getCall(0).args[0]).to.be.eql({
            type: 'notebooks/MODIFY_FRAME',
            payload: {
              frame: {
                id: '1',
                title: 'Updated frame',
                type: 'text',
                content: '<pre>Lorem ipsum</pre>',
                x: 0,
                y: 0,
                width: 800,
                height: 600,
                renderedContent: '<pre>Lorem ipsum</pre>',
                notebookId: '1',
                createdAt: new Date('1970-01-01T00:00:00.000Z'),
                updatedAt: new Date('1970-01-01T00:00:00.000Z'),
              }
            }
          });
        })
      );
    });
  });
});
