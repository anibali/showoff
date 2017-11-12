import _ from 'lodash';
import axios from 'axios';

import simpleActionCreators from './simpleActionCreators';


const actionCreators = _.clone(simpleActionCreators.auth);

actionCreators.signIn = (username, password) => (dispatch) =>
  axios.post('/auth/signin', { username, password }).then(() => {
    dispatch(actionCreators.setAuthenticated(true));
  });

actionCreators.signOut = () => (dispatch) =>
  axios.post('/auth/signout').then(() => {
    dispatch(actionCreators.setAuthenticated(false));
  });


export default actionCreators;
