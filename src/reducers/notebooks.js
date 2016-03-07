const _ = require('lodash');

const UPDATE_FRAME = Symbol('sconce/notebooks/UPDATE_FRAME');

const initialState = [];

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case UPDATE_FRAME: {
      const notebookIndex = _.findIndex(state, { id: action.frame.notebookId });

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

    default: return state;
  }
}

reducer.updateFrame = (frame) =>
  ({ type: UPDATE_FRAME, frame });

module.exports = reducer;
