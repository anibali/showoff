/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

const _ = require('lodash');
const fetch = require('../helpers/fetch');
const simpleActionCreators = require('./simpleActionCreators');


const actionCreators = _.clone(simpleActionCreators.notebooks);

const flattenResource = (resource) =>
  _.assign({ id: parseInt(resource.id, 10) }, resource.attributes);

actionCreators.updateFrame = (frame) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/frame/${frame.id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: _.pick(frame, ['x', 'y', 'width', 'height']) })
    }).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
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
  new Promise((resolve, reject) => {
    fetch(`/api/notebook/${notebook.id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook })
    }).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        dispatch(actionCreators.addNotebook(data.notebook));
        dispatch(simpleActionCreators.tags.removeTagsFromNotebook(data.notebook.id));
        dispatch(simpleActionCreators.tags.addTags(data.notebook.tags));
        resolve(data.notebook);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to update notebook');
      reject(err);
    });
  });

actionCreators.loadNotebook = (notebookId) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/notebook/${notebookId}`).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        dispatch(actionCreators.addNotebook(data.notebook));
        resolve(data.notebook);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load notebook');
      reject(err);
    });
  });

actionCreators.loadNotebooksShallow = () => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch('/api/v2/notebooks').then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        const notebooks = data.data.map(flattenResource);
        dispatch(actionCreators.addNotebooks(notebooks));
        resolve(notebooks);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load notebook');
      reject(err);
    });
  });

actionCreators.deleteNotebook = (notebookId) => (dispatch) =>
  fetch(`/api/notebook/${notebookId}`, { method: 'delete' }).then((res) => {
    if(!res.ok) throw new Error(res.statusText);
    dispatch(simpleActionCreators.tags.removeTagsFromNotebook(notebookId));
    dispatch(actionCreators.removeNotebook(notebookId));
  }).catch((err) => {
    console.error(err);
    alert('Failed to delete notebook');
  });


module.exports = actionCreators;
