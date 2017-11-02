import * as Redux from 'redux';
import { routerReducer } from 'react-router-redux';
import notebooks from './notebooksReducer';
import tags from './tagsReducer';


const combinedReducers = Redux.combineReducers({
  notebooks,
  tags,
  routing: routerReducer
});


export default combinedReducers;
