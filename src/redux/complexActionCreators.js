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

actionCreators.updateFrame = (frame, localOnly = false) => (dispatch) => {
  if(localOnly) {
    dispatch(simpleActionCreators.entities.mergeEntities({
      frames: { [frame.id]: frame }
    }));
    return Promise.resolve();
  }

  const reqBody = {
    data: serializeOne('frames', frame, { pick: ['x', 'y', 'width', 'height'] })
  };
  return apiClient.patch(`frames/${frame.id}?include=notebook`, reqBody)
    .then(res => deserialize(res.data))
    .then(simpleActionCreators.entities.mergeEntities)
    .then(dispatch);
};

actionCreators.updateNotebook = (notebook, tags) => (dispatch) => {
  const reqBody = {
    data: serializeOne('notebooks', notebook, { pick: ['pinned', 'title'] }),
  };
  if(tags) {
    _.set(reqBody, ['meta', 'included'],
      tags.map(tag => serializeOne('tags', tag, { pick: ['name'] }))
    );
  }
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
