const _ = require('lodash');
const fetch = require('../helpers/fetch');

const ADD_TAGS = Symbol('showoff/tags/ADD_TAGS');

const initialState = [];

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case ADD_TAGS: {
      const newState = _.clone(state);

      _.forEach(action.tags, (tag) => {
        const tagIndex = _.findIndex(state, { id: tag.id });

        if(tagIndex < 0) {
          newState.push(tag);
        } else {
          newState[tagIndex] = _.assign({}, newState[tagIndex], tag);
        }
      });

      return newState;
    }

    default: return state;
  }
}

const flattenResource = (resource) => {
  return _.assign({ id: parseInt(resource.id, 10) }, resource.attributes);
};

reducer.addTags = (tag) => {
  let tags = tag;
  if(!_.isArray(tags)) {
    tags = [tags];
  }
  return { type: ADD_TAGS, tags };
};

reducer.loadTagsShallow = () => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch('/api/v2/tags').then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        const tags = data.data.map(flattenResource);
        dispatch(reducer.addTags(tags));
        resolve(tags);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load tags');
      reject(err);
    });
  });

module.exports = reducer;
