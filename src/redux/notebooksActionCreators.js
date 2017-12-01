/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';
import normalize from 'json-api-normalizer';

import jsonApi from '../helpers/jsonApiClient';
import apiClient from '../helpers/apiClient';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = {};

// TODO: Change this function and callers so that `frame` is already in
//       normalized form
actionCreators.updateFrame = (frame, localOnly = false) => (dispatch) => {
  if(localOnly) {
    const normalizedEntity = {
      frames: {
        [frame.id]: {
          attributes: _.pick(frame, ['x', 'y', 'width', 'height'])
        }
      }
    };
    dispatch(simpleActionCreators.entities.mergeEntities(normalizedEntity));
    return Promise.resolve();
  }

  const reqBody = {
    data: jsonApi.serialize.resource.call(jsonApi, 'frames',
      _.omit(frame, ['createdAt', 'updatedAt', 'notebook', 'renderedContent', 'content'])),
  };
  return apiClient.patch(`frames/${frame.id}?include=notebook`, reqBody)
    .then(res => res.data)
    .then(normalize)
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);
};

// TODO: Change this function and callers so that `frame` is already in
//       normalized form
actionCreators.updateNotebook = (notebook) => (dispatch) => {
  const reqBody = {
    data: jsonApi.serialize.resource.call(jsonApi, 'notebooks', _.omit(notebook, ['createdAt', 'updatedAt'])),
    meta: {
      included: jsonApi.serialize.collection.call(jsonApi, 'tags', notebook.tags)
    }
  };
  return apiClient.patch(`notebooks/${notebook.id}?include=tags`, reqBody)
    .then(res => res.data)
    .then((resData) => {
      dispatch(simpleActionCreators.entities.removeTagsFromNotebook(resData.data.id));
      dispatch(simpleActionCreators.entities.mergeEntities(normalize(resData)));
    });
};

// FIXME: Should have to use ?include=frames
actionCreators.loadNotebook = (notebookId) => (dispatch) =>
  apiClient.get(`notebooks/${notebookId}`)
    .then(res => res.data)
    .then(normalize)
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);

actionCreators.loadNotebooksShallow = () => (dispatch) =>
  apiClient.get('notebooks')
    .then(res => res.data)
    .then(normalize)
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);

actionCreators.deleteNotebook = (notebookId) => (dispatch) =>
  apiClient.delete(`notebooks/${notebookId}`)
    .then(() => {
      dispatch(simpleActionCreators.entities.removeEntity('notebooks', notebookId));
      // TODO: Remove associated frames & tags
    });


export default actionCreators;
