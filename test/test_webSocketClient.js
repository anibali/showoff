const expect = require('must');
const sinon = require('sinon');
const { Server } = require('mock-socket');

const WebSocketClient = require('../src/webSocketClient');


describe('WebSocketClient', () => {
  const wsUrl = 'ws://localhost:8080';
  let clock = null;
  let mockServer = null;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    mockServer = new Server(wsUrl);
  });

  afterEach(() => {
    clock.restore();
    return new Promise(resolve => mockServer.stop(resolve));
  });

  it('dispatches a modify frame action', () => {
    mockServer.on('connection', () => {
      mockServer.send(JSON.stringify({ test: 'test' }));
    });

    const store = {
      dispatch: sinon.stub(),
    };

    const wsc = new WebSocketClient(wsUrl, store);
    wsc.connect();

    clock.tick(100);

    expect(store.dispatch.getCall(0).args[0]).to.eql({
      type: 'notebooks/MODIFY_FRAME',
      payload: {
        frame: {
          test: 'test'
        }
      }
    });
  });
});
