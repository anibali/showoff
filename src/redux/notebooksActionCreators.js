/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';

import jsonApi from '../helpers/jsonApiClient';
import fetch from '../helpers/fetch';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = _.clone(simpleActionCreators.notebooks);

actionCreators.updateFrame = (frame) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/frame/${frame.id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: _.pick(frame, ['x', 'y', 'width', 'height']) })
    }).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        data.id = data.id.toString();
        dispatch(actionCreators.modifyFrame(data));
        resolve(data.frame);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to update frame');
      reject(err);
    });
  });

actionCreators.updateNotebook = (notebook) => (dispatch) =>
  jsonApi.update(
    'notebook',
    _.omit(notebook, ['createdAt', 'updatedAt']),
    { include: 'tags' },
    { included: jsonApi.serialize.collection.call(jsonApi, 'tag', notebook.tags) }
  )
    .then((res) => {
      const updatedNotebook = res.data;
      dispatch(actionCreators.addNotebook(updatedNotebook));
      dispatch(simpleActionCreators.tags.removeTagsFromNotebook(updatedNotebook.id));
      const tags = updatedNotebook.tags.map(tag =>
        _.assign({}, tag, { notebookId: updatedNotebook.id }));
      dispatch(simpleActionCreators.tags.addTags(tags));
      return updatedNotebook;
    });

actionCreators.loadNotebook = (notebookId) => (dispatch) =>
  jsonApi.find('notebook', notebookId)
    .then(res => {
      dispatch(actionCreators.addNotebook(res.data));
      return res.data;
    });

actionCreators.loadNotebooksShallow = () => (dispatch) =>
  jsonApi.findAll('notebook')
    .then(res => {
      dispatch(actionCreators.addNotebooks(res.data));
      return res.data;
    });

actionCreators.deleteNotebook = (notebookId) => (dispatch) =>
  jsonApi.destroy('notebook', notebookId)
    .then(() => {
      dispatch(simpleActionCreators.tags.removeTagsFromNotebook(notebookId));
      dispatch(actionCreators.removeNotebook(notebookId));
    });


export default actionCreators;
