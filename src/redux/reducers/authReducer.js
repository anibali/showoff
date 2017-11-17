import { handleActions } from 'redux-actions';
import _ from 'lodash';
import simpleActionCreators from '../simpleActionCreators';


const defaultState = {
  authenticated: false,
  user: {
    apiKeys: [],
  },
};

const {
  setAuthenticated,
  setCurrentUserApiKeys,
  addCurrentUserApiKeys
} = simpleActionCreators.auth;

export default handleActions({
  [setAuthenticated](state, { payload: { authenticated } }) {
    return _.assign({}, state, {
      authenticated,
      user: authenticated ? state.user : defaultState.user,
    });
  },
  [setCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return _.assign({}, state, {
      user: _.assign({}, state.user, { apiKeys }),
    });
  },
  [addCurrentUserApiKeys](state, { payload: { apiKeys } }) {
    return _.assign({}, state, {
      user: _.assign({}, state.user, {
        apiKeys: state.user.apiKeys.concat(apiKeys),
      }),
    });
  },
}, defaultState);
