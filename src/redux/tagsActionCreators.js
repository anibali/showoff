/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

const _ = require('lodash');
const fetch = require('../helpers/fetch');
const simpleActionCreators = require('./simpleActionCreators');


const actionCreators = _.clone(simpleActionCreators.tags);

const flattenResource = (resource) => {
  const flat = _.assign({ id: parseInt(resource.id, 10) }, resource.attributes);
  if(resource.relationships) {
    _.assign(flat, ..._.map(resource.relationships, (v, k) => {
      return { [`${k}Id`]: parseInt(v.data.id, 10) };
    }));
  }
  return flat;
};

actionCreators.loadTagsShallow = () => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch('/api/v2/tags').then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        const tags = data.data.map(flattenResource);
        dispatch(actionCreators.addTags(tags));
        resolve(tags);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load tags');
      reject(err);
    });
  });


module.exports = actionCreators;
