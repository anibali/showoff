const Redux = require('redux');
const { routerReducer } = require('react-router-redux');

const notebooks = require('./notebooksReducer');
const tags = require('./tagsReducer');


const combinedReducers = Redux.combineReducers({
  notebooks,
  tags,
  routing: routerReducer
});


module.exports = combinedReducers;
