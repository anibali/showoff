const _ = require('lodash');

const UPDATE_FRAME = Symbol('sconce/notebooks/UPDATE_FRAME');


// The initial state is filled with some dummy data for debugging purposes
const initialState = [
  { frames: [] }
];

// The reducer function takes the current state and an action, and returns
// the new state after applying the action.
function reducer(state, action) {
  state = state || initialState;
  action = action || {};

  switch(action.type) {
    case UPDATE_FRAME: {
      // TODO: Make this work across multiple notebooks
      let updatedFrame = false;
      const frames = state[0].frames.map((frame) => {
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
      newState[0] = _.assign({}, state[0], { frames });
      return newState;
    }

    default: return state;
  }
}

reducer.updateFrame = (frame) =>
  ({ type: UPDATE_FRAME, frame });

module.exports = reducer;
