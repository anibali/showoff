/**
 * This is the entrypoint for our application in the web browser.
 * When the web page is loaded, this code will run on the client.
 */

require('whatwg-fetch');

const React = require('react');
const ReactDOM = require('react-dom');

// Require our root React component
const Root = require('./components/Root');

const createStore = require('./helpers/createStore');

window.main = (initialState) => {
  // Create a Redux store
  const store = createStore(initialState);

  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<Root store={store} />, mountPoint);
};
