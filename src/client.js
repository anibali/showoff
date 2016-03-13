/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const { Provider } = require('react-redux');
const { Router, browserHistory } = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');

const createStore = require('./helpers/createStore');
const routes = require('./routes');
const notebookActionCreators = require('./reducers/notebooks');

window.main = (initialState) => {
  // Create a Redux store
  const store = createStore(initialState);
  const history = syncHistoryWithStore(browserHistory, store);

  let ws = new WebSocket(`ws://${location.host}/`);

  ws.onopen = function() {
    console.log('WebSocket connection opened');
  };

  ws.onclose = function(event) {
    console.log('WebSocket connection closed', event.code, event.reason);
    ws = null;
  };

  ws.onmessage = function(event) {
    store.dispatch(notebookActionCreators.updateFrame(JSON.parse(event.data)));
  };

  const Root = () => (
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>
  );

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<Root />, mountPoint);
};
