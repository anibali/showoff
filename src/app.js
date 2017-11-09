import path from 'path';
import _ from 'lodash';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import { RouterContext, createMemoryHistory, match as matchRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import DocumentTitle from 'react-document-title';
import fs from 'fs-extra';
import mime from 'mime';
import React from 'react';
import reactDomServer from 'react-dom/server';
import { Provider } from 'react-redux';

import controllerRoutes from './config/routes';
import reactAsync from './helpers/reactAsync';
import routes from './routes';
import createStore from './redux/createStore';
import showoffConfig from './config/showoff';

const { uploadDir } = showoffConfig;

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

// Serve uploaded static files for notebooks
app.use('/notebooks', express.static(path.join(uploadDir, 'notebooks')));

const shouldCompress = (req, res) =>
  (req.headers['x-no-compression'] ? false : compression.filter(req, res));

app.use(compression({ filter: shouldCompress }));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb', type: 'application/vnd.api+json' }));

controllerRoutes.connect(app);

app.use((req, res) => {
  const store = createStore();
  const history = syncHistoryWithStore(createMemoryHistory(), store);

  const matchOpts = { history, routes, location: req.url };
  matchRoute(matchOpts, (matchError, redirectLocation, renderProps) => {
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
export default app;
