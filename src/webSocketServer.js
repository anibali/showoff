const notebookActionCreators = require('./redux/notebooksActionCreators');

class WebSocketServer {
  /**
   * wsServer is expected to be a ws.Server instance.
   */
  constructor(wsServer) {
    this.wsServer = wsServer;
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
}


module.exports = WebSocketServer;
