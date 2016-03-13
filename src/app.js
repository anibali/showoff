const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const reactRouter = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');

const React = require('react');
const reactDomServer = require('react-dom/server');
const { Provider } = require('react-redux');
const { RouterContext } = require('react-router');

const models = require('./models');
const routes = require('./routes');
const createStore = require('./helpers/createStore');

// Create a new Express app
const app = express();

app.use(compress());
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

      // TODO: Find a way of packing data in here so that the client doesn't
      // need to make an immediate AJAX request on page load.
      const reactHtml = reactDomServer.renderToString(<Root />);

      // The HTML is pretty barebones, it just provides a mount point
      // for React and links to our styles and scripts.
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
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
    }
  });
});

// Export the Express app
module.exports = app;
