class WebSocketServer {
  /**
   * wsServer is expected to be a ws.Server instance.
   */
  constructor(wsServer) {
    this.wsServer = wsServer;
  }

  broadcast(data) {
    this.wsServer.clients.forEach((client) => {
      client.send(data);
    });
  }

  fireFrameUpdate(frame) {
    this.broadcast(JSON.stringify(frame));
  }
}


module.exports = WebSocketServer;
