import notebookActionCreators from './redux/notebooksActionCreators';

class WebSocketServer {
  /**
   * wsServer is expected to be a ws.Server instance.
   */
  constructor(wsServer, opts) {
    this.wsServer = wsServer;
    const { keepAliveInterval = 10000 } = opts || {};
    if(keepAliveInterval) {
      this.keepAliveIntervalId =
        setInterval(this.keepAlive.bind(this), keepAliveInterval);
    }
  }

  keepAlive() {
    this.wsServer.clients.forEach((client) => {
      client.send('');
    });
  }

  broadcast(data) {
    const msg = JSON.stringify(data);
    this.wsServer.clients.forEach((client) => {
      client.send(msg);
    });
  }

  fireFrameUpdate(frame) {
    const action = notebookActionCreators.modifyFrame(frame);
    this.broadcast(action);
  }

  fireNotebookUpdate(notebook) {
    const action = notebookActionCreators.addNotebook(notebook);
    this.broadcast(action);
  }

  close() {
    if(this.keepAliveIntervalId) {
      clearInterval(this.keepAliveIntervalId);
    }
    this.wsServer.close();
  }
}


export default WebSocketServer;
