require('isomorphic-fetch');
const _ = require('lodash');

module.exports = (...args) => {
  const args2 = _.clone(args);
  if(!process.env.IN_BROWSER) {
    args2[0] = `http://localhost:3000${args2[0]}`;
  }
  return fetch(...args2);
};
