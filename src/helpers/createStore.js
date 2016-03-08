const Redux = require('redux');
const ReduxThunk = require('redux-thunk').default;

const combinedReducers = require('../reducers');

module.exports = (initialState) =>
  Redux.createStore(
    combinedReducers,
    initialState,
    Redux.applyMiddleware(ReduxThunk));
