/**
 * This is the entrypoint for our application on the server.
 * When the server is started, this code will run.
 */

// Use Babel to provide support for JSX
require('babel-core/register');

// Require our Express app (see app.js)
const app = require('./app');
const wss = require('./websocket-server');

// Start the server and wait for connections
const server = app.listen(3000, () => {
  console.log('Server started.');
});

wss.init({ server });

module.exports = server;
