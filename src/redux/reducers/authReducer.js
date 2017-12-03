import { handleActions } from 'redux-actions';
import { freeze, merge, assign, dissoc } from 'icepick';

import simpleActionCreators from '../simpleActionCreators';


const defaultState = freeze({
  authenticated: false,
  user: {
    apiKeys: [],
  },
  apiKeys: {},
});

const {
  setAuthenticated,
  setCurrentUserApiKeys,
  addCurrentUserApiKeys,
  removeCurrentUserApiKey,
} = simpleActionCreators.auth;

const authReducer = handleActions({
  [setAuthenticated](state, { payload: { authenticated } }) {
    return assign(state, {
      authenticated,
      user: authenticated ? state.user : defaultState.user,
      apiKeys: authenticated ? state.apiKeys : defaultState.apiKeys,
    });
  },
  [setCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return assign(state, { apiKeys });
  },
  [addCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return merge(state, { apiKeys });
  },
  [removeCurrentUserApiKey](state, { payload: { apiKeyId } }) {
    return assign(state, { apiKeys: dissoc(state.apiKeys, apiKeyId) });
  },
}, defaultState);


export default authReducer;
