const Redux = require('redux');
const { routerReducer } = require('react-router-redux');

const notebooks = require('./notebooks');
const tags = require('./tags');

module.exports = Redux.combineReducers({
  notebooks,
  tags,
  routing: routerReducer
});
