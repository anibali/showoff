const path = require('path');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const reactRouter = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');

const models = require('./models');
const routes = require('./routes');
const createStore = require('./helpers/createStore');
const frameViews = require('./frameViews');

// Create a new Express app
const app = express();

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
  // TODO: Don't fetch everything all of the time
  models('Notebook').fetchAll({ withRelated: ['frames'] }).then((notebooks) => {
    const initialState = {};

    const promises = [];
    initialState.notebooks = notebooks.toJSON().map((notebook) => {
      const frames = notebook.frames.map((frame) => {
        const newFrame = _.clone(frame);
        promises.push(
          frameViews.render(frame.content).then((content) => {
            newFrame.content = content;
          })
        );
        return newFrame;
      });
      return _.assign({}, notebook, { frames });
    });

    Promise.all(promises).then(() => {
      const store = createStore(initialState);
      const history = syncHistoryWithStore(reactRouter.createMemoryHistory(), store);

      const matchOpts = { history, routes, location: req.url };
      reactRouter.match(matchOpts, (error, redirectLocation, renderProps) => {
        if(error) {
          res.status(500).send(error.message);
        } else if(redirectLocation) {
          res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if(!renderProps) {
          res.status(404).send('Not found');
        } else {
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
                <script>main(${JSON.stringify(initialState)})</script>
              </body>
            </html>`;

          // Respond with the HTML
          res.send(htmlContent);
        }
      });
    }).catch((error) => res.status(500).send(error.message));
  }).catch((error) => res.status(500).send(error.message));
});

// Export the Express app
module.exports = app;
