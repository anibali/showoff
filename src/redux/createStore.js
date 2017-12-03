import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import combinedReducers from './reducers';
import rootSaga from './sagas/rootSaga';


export default (initialState) => {
  const sagaMiddleware = createSagaMiddleware();

  let composeEnhancers = Redux.compose;
  if(process.env.IN_BROWSER && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-underscore-dangle
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
  }

  const store = Redux.createStore(
    combinedReducers,
    initialState,
    composeEnhancers(Redux.applyMiddleware(ReduxThunk, sagaMiddleware)));

  sagaMiddleware.run(rootSaga);

  return store;
};
