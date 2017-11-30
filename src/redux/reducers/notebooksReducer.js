import { handleActions, combineActions } from 'redux-actions';
import _ from 'lodash';
import simpleActionCreators from '../simpleActionCreators';


const defaultState = [];

const {
  modifyFrame,
  addNotebook,
  addNotebooks,
  removeNotebook,
} = simpleActionCreators.notebooks;

const notebooksReducer = handleActions({
  [modifyFrame](state, { payload: { frame } }) {
    const notebookIndex = _.findIndex(state, { id: frame.notebook.id });

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
    return _.assign([], state, { [notebookIndex]: newNotebook });
  },
  [combineActions(addNotebook, addNotebooks)](state, { payload: { notebooks } }) {
    const newState = _.clone(state);

    notebooks.forEach((notebook) => {
      notebook = _.pick(notebook, 'id', 'title', 'pinned', 'progress',
        'createdAt', 'updatedAt', 'frames');
      if(notebook.frames) {
        notebook.frames.forEach((frame) => {
          frame.notebook = { type: 'notebooks', id: notebook.id };
        });
      }
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


export default notebooksReducer;
