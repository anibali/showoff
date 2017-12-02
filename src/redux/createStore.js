import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import combinedReducers from './reducers';
import rootSaga from './sagas/rootSaga';


export default (initialState) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = Redux.createStore(
    combinedReducers,
    initialState,
    Redux.applyMiddleware(ReduxThunk, sagaMiddleware));

  sagaMiddleware.run(rootSaga);

  return store;
};
