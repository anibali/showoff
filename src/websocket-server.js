const WebSocketServer = require('ws').Server;

const wss = {
  init: function(opts) {
    this.instance = new WebSocketServer(opts);
  },

  broadcast: function(data) {
    this.instance.clients.forEach((client) => {
      client.send(data);
    });
  }
};

module.exports = wss;
