const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const models = require('./models');
const serverState = require('./server-state');

// Create a new Express app
const app = express();

app.use(bodyParser.json());

// Serve up our static assets from 'dist' (this includes our client-side
// bundle of JavaScript). These assets are referred to in the HTML using
// <link> and <script> tags.
app.use('/assets', express.static(path.resolve(__dirname, '..', 'dist')));

// Serve up font-awesome fonts from vendor folder
app.use('/assets/fonts', express.static(path.join(__dirname,
        '..', 'vendor', 'font-awesome', 'fonts')));

require('./config/routes').connect(app);

// Set up the root route
app.get('/', (req, res) => {
  const initalState = serverState;

  // The HTML is pretty barebones, it just provides a mount point
  // for React and links to our styles and scripts.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="/assets/css/app.css">
      </head>
      <body>
        <div class="fill-space" id="root"></div>
        <script src="/assets/js/vendor.js"></script>
        <script src="/assets/js/app.js"></script>
        <script>main(${JSON.stringify(initalState)})</script>
      </body>
    </html>`;

  // Respond with the HTML
  res.send(htmlContent);
});

// Export the Express app
module.exports = app;
