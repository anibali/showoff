import { handleActions } from 'redux-actions';
import _ from 'lodash';

import simpleActionCreators from '../simpleActionCreators';
import merge from '../../helpers/immutableMerge';


const defaultState = {
  authenticated: false,
  user: {
    apiKeys: [],
  },
  apiKeys: {},
};

const {
  setAuthenticated,
  setCurrentUserApiKeys,
  addCurrentUserApiKeys,
  removeCurrentUserApiKey,
} = simpleActionCreators.auth;

const authReducer = handleActions({
  [setAuthenticated](state, { payload: { authenticated } }) {
    return _.assign({}, state, {
      authenticated,
      user: authenticated ? state.user : defaultState.user,
      apiKeys: authenticated ? state.apiKeys : defaultState.apiKeys,
    });
  },
  [setCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return _.assign({}, state, { apiKeys });
  },
  [addCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return merge({}, state, { apiKeys });
  },
  [removeCurrentUserApiKey](state, { payload: { apiKeyId } }) {
    return _.assign({}, state, { apiKeys: _.omit(state.apiKeys, apiKeyId) });
  },
}, defaultState);


export default authReducer;
