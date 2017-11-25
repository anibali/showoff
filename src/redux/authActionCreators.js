import _ from 'lodash';
import axios from 'axios';

import jsonApi from '../helpers/jsonApiClient';
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
  jsonApi.one('users', 'current').all('apiKeys').get().then((apiKeys) => {
    dispatch(actionCreators.setCurrentUserApiKeys(apiKeys.data));
    return apiKeys;
  });

actionCreators.createCurrentUserApiKey = () => (dispatch) =>
  jsonApi.one('users', 'current').all('apiKeys').post({}).then((apiKey) => {
    dispatch(actionCreators.addCurrentUserApiKeys([apiKey.data]));
    return apiKey;
  });

actionCreators.destroyCurrentUserApiKeys = () => (dispatch) =>
  jsonApi.one('users', 'current').all('apiKeys').destroy().then(() => {
    dispatch(actionCreators.setCurrentUserApiKeys([]));
  });

actionCreators.destroyApiKey = (apiKeyId) => (dispatch) =>
  jsonApi.one('users', 'current').one('apiKeys', apiKeyId).destroy().then(() => {
    dispatch(actionCreators.removeCurrentUserApiKey(apiKeyId));
  });

actionCreators.changeCurrentUserPassword = ({ oldPassword, newPassword }) => (dispatch) =>
  axios.patch('/api/v2/users/current/password', { oldPassword, newPassword }).then(() => {
    dispatch(actionCreators.setAuthenticated(false));
  });


export default actionCreators;
