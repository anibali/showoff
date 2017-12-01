/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import normalize from 'json-api-normalizer';

import apiClient from '../helpers/apiClient';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = {};

actionCreators.loadTagsShallow = () => (dispatch) =>
  apiClient.get('tags?include=notebook')
    .then(res => res.data)
    .then(normalize)
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);


export default actionCreators;
