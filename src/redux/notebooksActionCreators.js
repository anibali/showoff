/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';
import normalize from 'json-api-normalizer';

import apiClient from '../helpers/apiClient';
import simpleActionCreators from './simpleActionCreators';


const serializeEntity = (type, entity, opts) => {
  const { pick } = opts || {};
  let { attributes } = entity;
  if(pick !== undefined) {
    attributes = _.pick(attributes, pick);
  }
  return {
    type,
    id: entity.id,
    attributes,
  };
};

const actionCreators = {};

// TODO: Change this function and callers so that `frame` is already in
//       normalized form
actionCreators.updateFrame = (frame, localOnly = false) => (dispatch) => {
  const entity = {
    id: frame.id,
    attributes: _.pick(frame, ['x', 'y', 'width', 'height']),
  };

  if(localOnly) {
    dispatch(simpleActionCreators.entities.mergeEntities({
      frames: { [entity.id]: entity }
    }));
    return Promise.resolve();
  }

  const reqBody = { data: serializeEntity('frames', entity) };
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
    data: {
      id: notebook.id,
      type: 'notebooks',
      attributes: _.pick(notebook, ['pinned', 'title']),
    },
    meta: {
      included: notebook.tags.map(tag =>
        ({ id: tag.id, type: 'tags', attributes: _.pick(tag, ['name']) }))
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
      dispatch(simpleActionCreators.entities.removeNotebook(notebookId));
    });


export default actionCreators;
