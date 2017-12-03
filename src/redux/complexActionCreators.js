/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';

import apiClient from '../helpers/apiClient';
import { serializeOne, deserialize } from '../helpers/entitySerDe';
import simpleActionCreators from './simpleActionCreators';


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

  const reqBody = { data: serializeOne('frames', entity) };
  return apiClient.patch(`frames/${frame.id}?include=notebook`, reqBody)
    .then(res => deserialize(res.data))
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
      dispatch(simpleActionCreators.entities.mergeEntities(deserialize(resData)));
    });
};

actionCreators.loadNotebook = (notebookId) => (dispatch) =>
  apiClient.get(`notebooks/${notebookId}?include=frames`)
    .then(res => deserialize(res.data))
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);

actionCreators.loadNotebooksWithTags = () => (dispatch) =>
  apiClient.get('notebooks?include=tags')
    .then(res => deserialize(res.data))
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);

actionCreators.deleteNotebook = (notebookId) => (dispatch) =>
  apiClient.delete(`notebooks/${notebookId}`)
    .then(() => {
      dispatch(simpleActionCreators.entities.removeNotebook(notebookId));
    });


export default actionCreators;
