const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const reactRouter = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');
const DocumentTitle = require('react-document-title');
const fs = require('fs-extra');
const mime = require('mime');

const React = require('react');
const reactDomServer = require('react-dom/server');
const { Provider } = require('react-redux');
const { RouterContext } = require('react-router');

const reactAsync = require('./helpers/reactAsync');
const routes = require('./routes');
const createStore = require('./redux/createStore');

// Create a new Express app
const app = express();

const distDir = path.resolve(__dirname, '..', 'dist');

// Use gzipped version of assets if they are available and acceptable
app.use('/assets/bundle', (req, res, next) => {
  // Do nothing if client doesn't accept gzip encoding
  const accepts = req.headers['accept-encoding'];
  if(!(accepts && accepts.search(/[^\w]gzip[^\w]/))) {
    next();
    return;
  }

  const gzPath = `${req.url}.gz`;
  fs.access(path.join(distDir, gzPath), fs.constants.R_OK)
    .then(() => {
      res.set('Content-Type', mime.lookup(req.url));
      res.set('Content-Encoding', 'gzip');
      req.url = gzPath;
    })
    .catch(() => {})
    .then(() => next());
});

// Serve up our static assets from 'dist'
app.use('/assets/bundle', express.static(distDir));

const shouldCompress = (req, res) =>
  (req.headers['x-no-compression'] ? false : compression.filter(req, res));

app.use(compression({ filter: shouldCompress }));

app.use(bodyParser.json({ limit: '50mb' }));

require('./config/routes').connect(app);

app.use((req, res) => {
  const store = createStore();
  const history = syncHistoryWithStore(reactRouter.createMemoryHistory(), store);

  const matchOpts = { history, routes, location: req.url };
  reactRouter.match(matchOpts, (matchError, redirectLocation, renderProps) => {
    if(matchError) {
      res.status(500).send(matchError.message);
    } else if(redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if(!renderProps) {
      res.status(404).send('Not found');
    } else {
      const Root = () => (
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>
      );

      // First render will kick off asynchronous calls
      reactDomServer.renderToString(<Root />);

      // Try to complete all asynchronous calls on the server
      Promise.race([
        Promise.all(reactAsync.promises),
        new Promise((resolve) => setTimeout(resolve, 200)) // Timeout after 200ms
      ]).then(() => {
        // Render a second time, but hopefully this time including the data
        // returned from asynchronous calls
        const reactHtml = reactDomServer.renderToString(<Root />);

        const title = DocumentTitle.rewind();

        // The HTML is pretty barebones, it just provides a mount point
        // for React and links to our styles and scripts.
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <link rel="stylesheet" type="text/css" href="/assets/bundle/vendor.css">
              <link rel="stylesheet" type="text/css" href="/assets/bundle/app.css">
            </head>
            <body>
              <div class="fill-space" id="root">${reactHtml}</div>
              <script src="/assets/bundle/app.js"></script>
              <script>
                main(${JSON.stringify(_.omit(store.getState(), 'routing'))})
              </script>
            </body>
          </html>`;

        // Respond with the HTML
        res.send(htmlContent);
      }).catch((error) => {
        console.error(error);
        res.status(500).send(error.message);
      });
    }
  });
});

// Export the Express app
module.exports = app;
