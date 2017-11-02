import 'isomorphic-fetch';
import _ from 'lodash';

export default (...args) => {
  const args2 = _.clone(args);
  if(!process.env.IN_BROWSER) {
    args2[0] = `http://localhost:3000${args2[0]}`;
  }
  return fetch(...args2);
};
