import expect from 'must';
import sinon from 'sinon';
import _ from 'lodash';
import { factory } from 'factory-girl';
import FormData from 'form-data';
import path from 'path';
import fs from 'fs-extra';

import models from '../src/models';
import showoffConfig from '../src/config/showoff';


describe('API V2 Notebooks', () => {
  let clock = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
    return factory.cleanUp()
      .then(() => models.knex.raw('ALTER SEQUENCE files_id_seq RESTART WITH 1;'))
      .then(() => models.knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'));
  });

  describe('GET /notebooks', () => {
    const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks');

    describe('when there are two notebooks in the database', () => {
      beforeEach(() => factory.createMany('notebook', 2));

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
                progress: 0.5,
                title: 'Test notebook 1',
                createdAt: '1970-01-01T00:00:00.000Z',
                updatedAt: '1970-01-01T00:00:00.000Z',
              },
            },
            {
              type: 'notebooks',
              id: '2',
              attributes: {
                pinned: false,
                progress: 0.5,
                title: 'Test notebook 2',
                createdAt: '1970-01-01T00:00:00.000Z',
                updatedAt: '1970-01-01T00:00:00.000Z',
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
            progress: 0.25,
            title: 'New notebook',
          },
        },
      };

      afterEach(() => models('Notebook').forge({ id: 1 }).destroy());

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
              progress: 0.25,
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

  describe('GET /notebooks/:id', () => {
    beforeEach(() => factory.create('notebook', { id: 1 }));

    describe('when the notebook does not exist', () => {
      const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1337');

      it('should return HTTP status 404', () =>
        expect(sendRequest()).to.eventually.have.status(404)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return an error message', () =>
        expect(sendRequest().then(res => res.json())).to.eventually.have.property('error')
      );
    });

    describe('when the notebook exists', () => {
      const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1');

      it('should return HTTP status 200', () =>
        expect(sendRequest()).to.eventually.have.status(200)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return the notebook', () => {
        const expected = {
          data: {
            type: 'notebooks',
            id: '1',
            attributes: {
              pinned: false,
              progress: 0.5,
              title: 'Test notebook 1',
              createdAt: '1970-01-01T00:00:00.000Z',
              updatedAt: '1970-01-01T00:00:00.000Z',
            },
            relationships: {
              frames: {
                data: []
              }
            }
          },
          included: [],
        };

        return sendRequest()
          .then(res => res.json())
          .then(res => expect(res).to.eql(expected));
      });
    });
  });

  describe('DELETE /notebooks/:id', () => {
    beforeEach(() => factory.create('notebook', { id: 1 }));

    describe('when the notebook does not exist', () => {
      const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1337', {
        method: 'DELETE',
      });

      it('should return HTTP status 404', () =>
        expect(sendRequest()).to.eventually.have.status(404)
      );

      it('should have JSON content type', () =>
        expect(sendRequest()).to.eventually.have.jsonContent()
      );

      it('should return an error message', () =>
        expect(sendRequest().then(res => res.json())).to.eventually.have.property('error')
      );
    });

    describe('when the notebook exists', () => {
      const sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1', {
        method: 'DELETE',
      });

      it('should return HTTP status 204', () =>
        expect(sendRequest()).to.eventually.have.status(204)
      );
    });
  });

  describe('PATCH /notebooks/:id', () => {
    let broadcastStub;

    beforeEach(() => {
      broadcastStub = sinon.stub(global.wss, 'broadcast');
      return factory.create('notebook', { id: 1 });
    });

    afterEach(() => {
      broadcastStub.restore();
    });

    const sendRequest = body => fetch('http://localhost:3000/api/v2/notebooks/1', {
      method: 'PATCH',
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
          id: '1',
          attributes: {
            title: 'Updated notebook',
            progress: 0.75,
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
            type: 'notebooks',
            id: '1',
            attributes: {
              pinned: false,
              progress: 0.75,
              title: 'Updated notebook',
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

  describe('PUT /notebooks/:id/files', () => {
    let sendRequest;
    beforeEach(() => {
      const formData = new FormData();
      formData.append('file', 'Hello', 'test.txt');
      sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1/files', {
        method: 'PUT',
        body: formData,
      });
      return factory.create('notebook', { id: 1 });
    });

    const filePath = path.join(showoffConfig.uploadDir,
      'notebooks', '1', 'files', 'test.txt');

    describe('when the file does not exist yet', () => {
      it('should create the file in the uploads directory', () =>
        sendRequest()
          .then(() => fs.readFile(filePath, 'utf8'))
          .then((content) => {
            expect(content).to.equal('Hello');
          })
      );

      it('should create a File record in the database', () =>
        sendRequest()
          .then(() => models('File').where({ notebookId: 1, filename: 'test.txt' }).count())
          .then((count) => {
            expect(parseInt(count, 10)).to.equal(1);
          })
      );
    });

    describe('when the file already exists', () => {
      beforeEach(() => fs.remove(path.join(showoffConfig.uploadDir, 'notebooks'))
        .then(() => factory.create('file', { notebookId: 1, filename: 'test.txt' }))
      );

      it('should replace the file in the uploads directory', () =>
        fs.readFile(filePath, 'utf8')
          .then((content) => {
            expect(content).to.equal('Ciao');
          })
          .then(() => sendRequest())
          .then(() => fs.readFile(filePath, 'utf8'))
          .then((content) => {
            expect(content).to.equal('Hello');
          })
      );

      it('should not create another File record in the database', () =>
        sendRequest()
          .then(() => models('File').where({ notebookId: 1, filename: 'test.txt' }).count())
          .then((count) => {
            expect(parseInt(count, 10)).to.equal(1);
          })
      );
    });
  });

  describe('PATCH /notebooks/:id/files', () => {
    let sendRequest;
    beforeEach(() => {
      const formData = new FormData();
      formData.append('file', 'Hello', 'test.txt');
      sendRequest = () => fetch('http://localhost:3000/api/v2/notebooks/1/files', {
        method: 'PATCH',
        body: formData,
      });
      return factory.create('notebook', { id: 1 });
    });

    const filePath = path.join(showoffConfig.uploadDir,
      'notebooks', '1', 'files', 'test.txt');

    describe('when the file does not exist yet', () => {
      it('should create the file in the uploads directory', () =>
        sendRequest()
          .then(() => fs.readFile(filePath, 'utf8'))
          .then((content) => {
            expect(content).to.equal('Hello');
          })
      );

      it('should create a File record in the database', () =>
        sendRequest()
          .then(() => models('File').where({ notebookId: 1, filename: 'test.txt' }).count())
          .then((count) => {
            expect(parseInt(count, 10)).to.equal(1);
          })
      );
    });

    describe('when the file already exists', () => {
      beforeEach(() => fs.remove(path.join(showoffConfig.uploadDir, 'notebooks'))
        .then(() => factory.create('file', { notebookId: 1, filename: 'test.txt' }))
      );

      it('should append to the file in the uploads directory', () =>
        fs.readFile(filePath, 'utf8')
          .then((content) => {
            expect(content).to.equal('Ciao');
          })
          .then(() => sendRequest())
          .then(() => fs.readFile(filePath, 'utf8'))
          .then((content) => {
            expect(content).to.equal('CiaoHello');
          })
      );

      it('should not create another File record in the database', () =>
        sendRequest()
          .then(() => models('File').where({ notebookId: 1, filename: 'test.txt' }).count())
          .then((count) => {
            expect(parseInt(count, 10)).to.equal(1);
          })
      );
    });
  });
});
