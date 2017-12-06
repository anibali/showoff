/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

// eslint-disable-next-line
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { freeze } from 'icepick';

import createStore from './redux/createStore';
import WebSocketClient from './webSocketClient';
import ClientRoot from './components/ClientRoot';


window.main = (initialState) => {
  // Create a Redux store
  const store = createStore(freeze(initialState));

  const wsProtocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  window.wsc = new WebSocketClient(`${wsProtocol}//${window.location.host}/`, store);
  if(store.getState().auth.authenticated) {
    window.wsc.connect();
  }

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.hydrate(<ClientRoot store={store} />, mountPoint);
};
