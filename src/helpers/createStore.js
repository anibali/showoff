const Redux = require('redux');
const reduxThunk = require('redux-thunk');

const combinedReducers = require('../reducers');

const finalCreateStore = Redux.compose(
  // Enable middleware
  Redux.applyMiddleware(reduxThunk)
)(Redux.createStore);

module.exports = initialState => finalCreateStore(combinedReducers, initialState);
