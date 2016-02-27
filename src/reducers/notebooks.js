const REFRESH_NOTEBOOK = Symbol('sconce/cellList/CHANGE_CODE');

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
    case REFRESH_NOTEBOOK: {
      console.log('TODO: Refresh notebook');
      return state;
    }

    default: return state;
  }
}

reducer.refreshNotebook = (notebookId) =>
  ({ type: REFRESH_NOTEBOOK, notebookId });

module.exports = reducer;
