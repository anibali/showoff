const Redux = require('redux');

const notebooks = require('./notebooks');

module.exports = Redux.combineReducers({
  notebooks
});
