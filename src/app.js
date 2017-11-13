import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import { StaticRouter } from 'react-router';
import { matchPath } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import fs from 'fs-extra';
import mime from 'mime';
import React from 'react';
import reactDomServer from 'react-dom/server';

import appAuth from './config/appAuth';
import frontendRoutes from './components/frontendRoutes';
import controllerRoutes from './config/routes';
import createStore from './redux/createStore';
import simpleActionCreators from './redux/simpleActionCreators';
import showoffConfig from './config/showoff';
import Root from './components/Root';


const { uploadDir } = showoffConfig;

// Create a new Express app
const app = express();

appAuth(app);

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

// Sanitise a JSON string so that it can be safely inserted inside
// <script> tags
const sanitiseJson = (jsonString) =>
  jsonString.replace(/</g, '\\u003c').replace(/-->/g, '--\\>');

app.use((req, res) => {
  const context = { status: 200 };
  const store = createStore();

  store.dispatch(simpleActionCreators.auth.setAuthenticated(req.isAuthenticated()));

  const promises = [];

  frontendRoutes.some(route => {
    const match = matchPath(req.path, route);
    if(match && route.component.preloadData) {
      const satisfiesAuth = !route.requiresAuth || req.isAuthenticated();
      if(satisfiesAuth) {
        promises.push(route.component.preloadData(store.dispatch, match));
      }
    }
    return match;
  });

  const promise = Promise.race([
    Promise.all(promises),
    new Promise((resolve) => setTimeout(resolve, 200)) // Timeout after 200ms
  ]).catch((err) => {
    console.error('Failed to preload data:');
    console.error(err);
  });

  promise.then(() => {
    const Router = props => (
      <StaticRouter location={req.url} context={context}>
        {props.children}
      </StaticRouter>
    );

    // Server-side rendering
    const reactHtml = reactDomServer.renderToString(<Root store={store} Router={Router} />);

    const storeState = sanitiseJson(JSON.stringify(store.getState()));

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
            main(${storeState})
          </script>
        </body>
      </html>`;

    // Respond with the HTML
    res.status(context.status).send(htmlContent);
  }).catch((error) => {
    console.error(error);
    res.status(500).send(error.message);
  });
});


// Export the Express app
export default app;
