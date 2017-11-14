/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

// eslint-disable-next-line
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import createStore from './redux/createStore';
import WebSocketClient from './webSocketClient';
import Root from './components/Root';

import jsonApi from './helpers/jsonApiClient';

if(process.env.NODE_ENV === 'development') {
  // Expose globally for debugging purposes
  window.jsonApi = jsonApi;
}

window.main = (initialState) => {
  // Create a Redux store
  const store = createStore(initialState);

  const wsc = new WebSocketClient(`ws://${window.location.host}/`, store);
  wsc.connect();

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.hydrate(<Root store={store} Router={BrowserRouter} />, mountPoint);
};
