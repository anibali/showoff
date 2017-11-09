/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';

import fetch from '../helpers/fetch';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = _.clone(simpleActionCreators.tags);

const flattenResource = ({ id, attributes, relationships }) => {
  const flat = _.assign({ id }, attributes);
  if(relationships) {
    _.assign(flat, ..._.map(relationships, (v, k) =>
      ({ [`${k}Id`]: v.data.id })
    ));
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


export default actionCreators;
