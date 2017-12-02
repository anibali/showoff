// import { HybridMap } from 'hybrid-map';


// NOTE: Currently, if we use HybridMap then non-object keys can cause cached
// values to stick around forever
const MapImpl = WeakMap;

const recursiveCacheSet = (cache, keys, value) => {
  if(keys.length < 1) {
    throw Error('expected at least 1 key');
  }
  const [head, ...tail] = keys;
  if(keys.length === 1) {
    cache.set(head, value);
    return;
  }

  let subCache;
  if(cache.has(head)) {
    subCache = cache.get(head);
  } else {
    subCache = new MapImpl();
    cache.set(head, subCache);
  }
  recursiveCacheSet(subCache, tail, value);
};

const recursiveCacheGet = (cache, keys) =>
  keys.reduce((subCache, arg) => subCache && subCache.get(arg), cache);

// eslint-disable-next-line import/prefer-default-export
export const createSelector = (inputSelectors, resultFunc) => {
  if(inputSelectors.length === 0) {
    inputSelectors = [firstArg => firstArg];
  }

  const cache = new MapImpl();

  return (...args) => {
    const resultFuncArgs = inputSelectors.map(fn => fn(...args));

    const firstKeys = resultFuncArgs.slice(0, -1);
    const lastKey = resultFuncArgs[resultFuncArgs.length - 1];

    const leafCache = recursiveCacheGet(cache, firstKeys);

    if(leafCache && leafCache.has(lastKey)) {
      return leafCache.get(lastKey);
    }

    const result = resultFunc(...resultFuncArgs);

    if(leafCache) {
      leafCache.set(lastKey, result);
    } else {
      recursiveCacheSet(cache, resultFuncArgs, result);
    }

    return result;
  };
};
