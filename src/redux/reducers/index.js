import * as Redux from 'redux';
import notebooks from './notebooksReducer';
import tags from './tagsReducer';
import auth from './authReducer';


const combinedReducers = Redux.combineReducers({
  notebooks,
  tags,
  auth,
});


export default combinedReducers;
