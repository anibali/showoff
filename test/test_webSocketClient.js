import expect from 'must';
import sinon from 'sinon';
import { Server } from 'mock-socket';
import WebSocketClient from '../src/webSocketClient';


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

    expect(store.dispatch.getCall(0).args[0]).to.eql({ test: 'test' });
  });
});
