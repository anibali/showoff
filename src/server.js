/**
 * This is the entrypoint for our application on the server.
 * When the server is started, this code will run.
 */

// Use Babel to provide support for JSX
require('babel-core/register');

const http = require('http');
const ws = require('ws');

const createApp = require('./createApp').default;
const WebSocketServer = require('./webSocketServer').default;
const sessionParser = require('./config/sessionParser').default;


createApp().then((app) => {
  const server = http.createServer(app);
  server.listen(3000, () => {
    console.log('Server started.');
    global.wss = new WebSocketServer(new ws.Server({
      verifyClient: (info, done) => {
        sessionParser(info.req, {}, () => {
          if(!info.req.session.passport) {
            done(null);
            return;
          }
          done(info.req.session.passport.user);
        });
      },
      server
    }));
  });
});
