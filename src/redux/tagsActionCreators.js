/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';

import jsonApi from '../helpers/jsonApiClient';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = _.clone(simpleActionCreators.tags);

actionCreators.loadTagsShallow = () => (dispatch) =>
  jsonApi.findAll('tags', { include: 'notebook' })
    .then(res => {
      const tags = res.data;
      tags.forEach(tag => { tag.notebookId = tag.notebook.id; });
      dispatch(actionCreators.addTags(tags));
      return tags;
    });


export default actionCreators;
