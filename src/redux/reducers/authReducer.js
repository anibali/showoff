import { handleActions } from 'redux-actions';
import _ from 'lodash';
import simpleActionCreators from '../simpleActionCreators';


const defaultState = {
  authenticated: false,
};

const { setAuthenticated } = simpleActionCreators.auth;

export default handleActions({
  [setAuthenticated](state, { payload: { authenticated } }) {
    return _.assign(state, { authenticated });
  },
}, defaultState);
