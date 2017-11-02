import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import combinedReducers from './reducers';

export default (initialState) =>
  Redux.createStore(
    combinedReducers,
    initialState,
    Redux.applyMiddleware(ReduxThunk));
