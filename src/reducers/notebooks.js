const _ = require('lodash');
const fetch = require('../helpers/fetch');
const tagActionCreators = require('./tags');

const MODIFY_FRAME = Symbol('showoff/notebooks/MODIFY_FRAME');
const ADD_NOTEBOOKS = Symbol('showoff/notebooks/ADD_NOTEBOOKS');
const REMOVE_NOTEBOOK = Symbol('showoff/notebooks/REMOVE_NOTEBOOK');

const initialState = [];

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case MODIFY_FRAME: {
      const notebookIndex = _.findIndex(state, { id: action.frame.notebookId });

      // Ignore update if the frame's notebook hasn't been loaded
      if(!state[notebookIndex] || !state[notebookIndex].frames) {
        return state;
      }

      let updatedFrame = false;
      const frames = state[notebookIndex].frames.map((frame) => {
        if(frame.id === action.frame.id) {
          updatedFrame = true;
          return _.assign({}, frame, action.frame);
        }
        return frame;
      });
      if(!updatedFrame) {
        frames.push(action.frame);
      }
      const newState = _.clone(state);
      newState[notebookIndex] = _.assign({}, state[notebookIndex], { frames });
      return newState;
    }

    case ADD_NOTEBOOKS: {
      const newState = _.clone(state);

      _.forEach(action.notebooks, (notebook) => {
        notebook = _.pick(notebook, 'id', 'title', 'pinned', 'createdAt', 'updatedAt', 'frames');
        const notebookIndex = _.findIndex(state, { id: notebook.id });

        if(notebookIndex < 0) {
          newState.push(notebook);
        } else {
          newState[notebookIndex] = _.assign({}, newState[notebookIndex], notebook);
        }
      });

      return newState;
    }

    case REMOVE_NOTEBOOK: {
      return _.reject(state, { id: action.notebookId });
    }

    default: return state;
  }
}

const flattenResource = (resource) => {
  return _.assign({ id: parseInt(resource.id, 10) }, resource.attributes);
};

reducer.modifyFrame = (frame) =>
  ({ type: MODIFY_FRAME, frame });

reducer.updateFrame = (frame) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/frame/${frame.id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: _.pick(frame, ['x', 'y', 'width', 'height']) })
    }).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        dispatch(reducer.modifyFrame(data));
        resolve(data.frame);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to update frame');
      reject(err);
    });
  });

reducer.addNotebook = (notebook) => {
  let notebooks = notebook;
  if(!_.isArray(notebooks)) {
    notebooks = [notebooks];
  }
  return { type: ADD_NOTEBOOKS, notebooks };
};

reducer.removeNotebook = (notebookId) =>
  ({ type: REMOVE_NOTEBOOK, notebookId });

reducer.updateNotebook = (notebook) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/notebook/${notebook.id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook })
    }).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        dispatch(reducer.addNotebook(data.notebook));
        dispatch(tagActionCreators.removeTagsFromNotebook(data.notebook.id));
        dispatch(tagActionCreators.addTags(data.notebook.tags));
        resolve(data.notebook);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to update notebook');
      reject(err);
    });
  });

reducer.loadNotebook = (notebookId) => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch(`/api/notebook/${notebookId}`).then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        dispatch(reducer.addNotebook(data.notebook));
        resolve(data.notebook);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load notebook');
      reject(err);
    });
  });

reducer.loadNotebooksShallow = () => (dispatch) =>
  new Promise((resolve, reject) => {
    fetch('/api/v2/notebooks').then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        const notebooks = data.data.map(flattenResource);
        dispatch(reducer.addNotebook(notebooks));
        resolve(notebooks);
      }).catch(reject);
    }).catch((err) => {
      console.error(err);
      alert('Failed to load notebook');
      reject(err);
    });
  });

reducer.deleteNotebook = (notebookId) => (dispatch) =>
  fetch(`/api/notebook/${notebookId}`, { method: 'delete' }).then((res) => {
    if(!res.ok) throw new Error(res.statusText);
    dispatch(reducer.removeNotebook(notebookId));
  }).catch((err) => {
    console.error(err);
    alert('Failed to delete notebook');
  });

module.exports = reducer;
