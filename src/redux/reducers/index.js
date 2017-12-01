import * as Redux from 'redux';
import entities from './entitiesReducer';
import auth from './authReducer';


const combinedReducers = Redux.combineReducers({
  entities,
  auth,
});


export default combinedReducers;
