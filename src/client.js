/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import createStore from './redux/createStore';
import routes from './routes';
import WebSocketClient from './webSocketClient';

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
