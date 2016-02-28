const Redux = require('redux');
const { routerReducer } = require('react-router-redux');

const notebooks = require('./notebooks');

module.exports = Redux.combineReducers({
  notebooks,
  routing: routerReducer
});
