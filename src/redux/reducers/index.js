import * as Redux from 'redux';
import notebooks from './notebooksReducer';
import tags from './tagsReducer';


const combinedReducers = Redux.combineReducers({
  notebooks,
  tags,
});


export default combinedReducers;
