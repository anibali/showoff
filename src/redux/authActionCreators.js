import _ from 'lodash';
import axios from 'axios';
import normalize from 'json-api-normalizer';

import apiClient from '../helpers/apiClient';
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

actionCreators.loadCurrentUserApiKeys = () => (dispatch) =>
  apiClient.get('users/current/apiKeys')
    .then(res => res.data)
    .then(normalize)
    .then(normalized => normalized.apiKeys)
    .then(actionCreators.setCurrentUserApiKeys)
    .then(dispatch);

actionCreators.createCurrentUserApiKey = () => (dispatch) =>
  apiClient.post('users/current/apiKeys')
    .then(res => res.data)
    .then(normalize)
    .then(normalized => {
      dispatch(actionCreators.addCurrentUserApiKeys(normalized.apiKeys));
      return _.values(normalized.apiKeys)[0];
    });

actionCreators.destroyApiKey = (apiKeyId) => (dispatch) =>
  apiClient.delete(`users/current/apiKeys/${apiKeyId}`).then(() => {
    dispatch(actionCreators.removeCurrentUserApiKey(apiKeyId));
  });

actionCreators.changeCurrentUserPassword = ({ oldPassword, newPassword }) => (dispatch) =>
  axios.patch('/api/v2/users/current/password', { oldPassword, newPassword }).then(() => {
    dispatch(actionCreators.setAuthenticated(false));
  });


export default actionCreators;
