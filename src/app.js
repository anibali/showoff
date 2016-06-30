const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const reactRouter = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');
const DocumentTitle = require('react-document-title');

const React = require('react');
const reactDomServer = require('react-dom/server');
const { Provider } = require('react-redux');
const { RouterContext } = require('react-router');

const reactAsync = require('./helpers/reactAsync');
const routes = require('./routes');
const createStore = require('./helpers/createStore');

// Create a new Express app
const app = express();

const shouldCompress = (req, res) =>
  req.headers['x-no-compression'] ? false : compression.filter(req, res);

app.use(compression({ filter: shouldCompress }));
app.use(bodyParser.json({ limit: '50mb' }));

// Serve up our static assets from 'dist' (this includes our client-side
// bundle of JavaScript). These assets are referred to in the HTML using
// <link> and <script> tags.
app.use('/assets', express.static(path.resolve(__dirname, '..', 'dist')));

// Serve up font-awesome fonts from vendor folder
app.use('/assets/fonts', express.static(path.join(__dirname,
        '..', 'vendor', 'font-awesome', 'fonts')));

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
              <link rel="stylesheet" type="text/css" href="/assets/css/app.css">
            </head>
            <body>
              <div class="fill-space" id="root">${reactHtml}</div>
              <script src="/assets/js/vendor.js"></script>
              <script src="/assets/js/app.js"></script>
              <script>
                main(${JSON.stringify(_.omit(store.getState(), 'routing'))})
              </script>
            </body>
          </html>`;

        // Respond with the HTML
        res.send(htmlContent);
      }).catch((error) => {
        res.status(500).send(error.message);
      });
    }
  });
});

// Export the Express app
module.exports = app;
