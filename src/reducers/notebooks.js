const _ = require('lodash');
const fetch = require('../helpers/fetch');

const UPDATE_FRAME = Symbol('sconce/notebooks/UPDATE_FRAME');
const ADD_NOTEBOOK = Symbol('sconce/notebooks/ADD_NOTEBOOK');
const REMOVE_NOTEBOOK = Symbol('sconce/notebooks/REMOVE_NOTEBOOK');

const initialState = [];

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case UPDATE_FRAME: {
      const notebookIndex = _.findIndex(state, { id: action.frame.notebookId });

      // Ignore update if the frame's notebook hasn't been loaded
      if(!state[notebookIndex].frames) {
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

    case ADD_NOTEBOOK: {
      const notebookIndex = _.findIndex(state, { id: action.notebook.id });

      let newState;
      if(notebookIndex < 0) {
        newState = state.concat(action.notebook);
      } else {
        newState = _.clone(state);
        newState[notebookIndex] = _.assign({}, newState[notebookIndex], action.notebook);
      }

      return newState;
    }

    case REMOVE_NOTEBOOK: {
      return _.reject(state, { id: action.notebookId });
    }

    default: return state;
  }
}

reducer.updateFrame = (frame) =>
  ({ type: UPDATE_FRAME, frame });

reducer.addNotebook = (notebook) =>
  ({ type: ADD_NOTEBOOK, notebook });

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
    fetch('/api/notebooks').then((res) => {
      if(!res.ok) throw new Error(res.statusText);
      res.json().then((data) => {
        data.notebooks.forEach((notebook) => {
          dispatch(reducer.addNotebook(notebook));
        });
        resolve(data.notebooks);
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
