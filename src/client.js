/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

require('babel-polyfill');

const React = require('react');
const ReactDOM = require('react-dom');
const { Provider } = require('react-redux');
const { Router, browserHistory } = require('react-router');
const { syncHistoryWithStore } = require('react-router-redux');

const createStore = require('./redux/createStore');
const routes = require('./routes');
const WebSocketClient = require('./webSocketClient');

window.main = (initialState) => {
  // Create a Redux store
  const store = createStore(initialState);
  const history = syncHistoryWithStore(browserHistory, store);

  const wsc = new WebSocketClient(`ws://${window.location.host}/`, store);
  wsc.connect();

  const Root = () => (
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>
  );

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<Root />, mountPoint);
};
