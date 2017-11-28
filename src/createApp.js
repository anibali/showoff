import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import { matchPath } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import fs from 'fs-extra';
import mime from 'mime';
import React from 'react';
import reactDomServer from 'react-dom/server';

import { SheetsRegistry } from 'react-jss/lib/jss';

import configureAuth from './config/configureAuth';
import BodyClass from './components/BodyClass';
import frontendRoutes from './components/frontendRoutes';
import controllerRoutes from './config/routes';
import createStore from './redux/createStore';
import simpleActionCreators from './redux/simpleActionCreators';
import showoffConfig from './config/showoff';
import ServerRoot from './components/ServerRoot';


/**
 * The HTML is pretty barebones, it just provides a mount point
 * for React and links to our styles and scripts.
 */
const renderHtmlPage = (title, bodyClassName, reactHtml, storeState, css, assetManifest) => (`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <link rel="stylesheet" type="text/css" href="${assetManifest['app.css']}">
    </head>
    <body class="${bodyClassName}">
      <div class="fill-space" id="root">${reactHtml}</div>
      <style id="jss-server-side">${css}</style>
      <script src="${assetManifest['app.js']}"></script>
      <script>main(${storeState})</script>
    </body>
  </html>
`);

// Use gzipped version of assets if they are available and acceptable
const preferGzippedAssets = (req, res, next) => {
  const distDir = path.resolve(__dirname, '..', 'dist');

  // Do nothing if client doesn't accept gzip encoding
  const accepts = req.headers['accept-encoding'];
  if(!(accepts && accepts.search(/[^\w]gzip[^\w]/))) {
    next();
    return;
  }

  const gzPath = `${req.url}.gz`;
  fs.access(path.join(distDir, gzPath), fs.constants.R_OK)
    .then(() => {
      res.set('Content-Type', mime.getType(req.url));
      res.set('Content-Encoding', 'gzip');
      req.url = gzPath;
    })
    .catch(() => {})
    .then(() => next());
};


export default () => Promise.resolve()
  .then(() => express())
  .then(configureAuth)
  .then((app) => {
    const { uploadDir } = showoffConfig;

    const distDir = path.resolve(__dirname, '..', 'dist');

    // Serve up our static assets from 'dist'
    app.use('/assets/bundle', preferGzippedAssets, express.static(distDir));

    // Serve uploaded static files for notebooks
    app.use('/notebooks', express.static(path.join(uploadDir, 'notebooks')));

    const shouldCompress = (req, res) =>
      (req.headers['x-no-compression'] ? false : compression.filter(req, res));

    app.use(compression({ filter: shouldCompress }));

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.json({ limit: '50mb', type: 'application/vnd.api+json' }));

    controllerRoutes.connect(app);

    const assetManifest = JSON.parse(
      fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'));

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
        const sheetsRegistry = new SheetsRegistry();

        // Server-side rendering
        const reactHtml = reactDomServer.renderToString(
          <ServerRoot
            store={store}
            location={req.url}
            context={context}
            sheetsRegistry={sheetsRegistry}
          />
        );
        const storeState = sanitiseJson(JSON.stringify(store.getState()));
        const title = DocumentTitle.rewind();
        const bodyClassName = BodyClass.rewind() || '';
        const css = sheetsRegistry.toString();

        // Respond with the HTML
        const htmlContent = renderHtmlPage(title, bodyClassName, reactHtml, storeState, css, assetManifest);
        res.status(context.status).send(htmlContent);
      }).catch((error) => {
        console.error(error);
        res.status(500).send(error.message);
      });
    });

    return app;
  });
