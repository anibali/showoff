const { handleActions, combineActions } = require('redux-actions');

const _ = require('lodash');
const simpleActionCreators = require('../simpleActionCreators');


const defaultState = [];

const {
  modifyFrame,
  addNotebook,
  addNotebooks,
  removeNotebook,
} = simpleActionCreators.notebooks;

const notebooksReducer = handleActions({
  [modifyFrame](state, { payload: { frame } }) {
    const notebookIndex = _.findIndex(state, { id: frame.notebookId });

    // Ignore update if the frame's notebook hasn't been loaded
    if(!state[notebookIndex] || !state[notebookIndex].frames) {
      return state;
    }

    let updatedFrame = false;
    const frames = state[notebookIndex].frames.map((curFrame) => {
      if(curFrame.id === frame.id) {
        updatedFrame = true;
        return _.assign({}, curFrame, frame);
      }
      return curFrame;
    });
    if(!updatedFrame) {
      frames.push(frame);
    }

    const newNotebook = _.assign({}, state[notebookIndex], { frames });
    return _.assign([], { [notebookIndex]: newNotebook });
  },
  [combineActions(addNotebook, addNotebooks)](state, { payload: { notebooks } }) {
    const newState = _.clone(state);

    notebooks.forEach((notebook) => {
      notebook = _.pick(notebook, 'id', 'title', 'pinned', 'progress',
        'createdAt', 'updatedAt', 'frames');
      const notebookIndex = _.findIndex(state, { id: notebook.id });

      if(notebookIndex < 0) {
        newState.push(notebook);
      } else {
        newState[notebookIndex] = _.assign({}, newState[notebookIndex], notebook);
      }
    });

    return newState;
  },
  [removeNotebook](state, { payload: { notebookId } }) {
    return _.reject(state, { id: notebookId });
  },
}, defaultState);


module.exports = notebooksReducer;
