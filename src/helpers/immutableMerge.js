import _ from 'lodash';


/**
 * Deep merge function which skips merging items that are referentially equal.
 */
const immutableMerge = (...things) => {
  if(things.length < 1) {
    return undefined;
  }
  if(things.length === 1) {
    return things[0];
  }
  if(things.length > 2) {
    const [head, ...tail] = things;
    return immutableMerge(head, immutableMerge(...tail));
  }
  const [a, b] = things;
  if(a === b) {
    return a;
  }
  if(_.isPlainObject(a) && _.isPlainObject(b)) {
    return _.assignWith({}, a, b, (x, y) => immutableMerge(x, y));
  }
  if(_.isArray(a) && _.isArray(b)) {
    return _.assignWith([], a, b, (x, y) => immutableMerge(x, y));
  }
  return b;
};


export default immutableMerge;
