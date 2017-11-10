/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import _ from 'lodash';

import jsonApi from '../helpers/jsonApiClient';
import simpleActionCreators from './simpleActionCreators';


const actionCreators = _.clone(simpleActionCreators.notebooks);

actionCreators.updateFrame = (frame) => (dispatch) =>
  jsonApi.update(
    'frames',
    _.omit(frame, ['createdAt', 'updatedAt', 'notebookId', 'renderedContent', 'content']),
  )
    .then((res) => {
      dispatch(actionCreators.modifyFrame(res.data));
      return res.data;
    });

actionCreators.updateNotebook = (notebook) => (dispatch) =>
  jsonApi.update(
    'notebooks',
    _.omit(notebook, ['createdAt', 'updatedAt']),
    { include: 'tags' },
    { included: jsonApi.serialize.collection.call(jsonApi, 'tags', notebook.tags) }
  )
    .then((res) => {
      const updatedNotebook = res.data;
      dispatch(actionCreators.addNotebook(updatedNotebook));
      dispatch(simpleActionCreators.tags.removeTagsFromNotebook(updatedNotebook.id));
      const tags = updatedNotebook.tags.map(tag =>
        _.assign({}, tag, { notebookId: updatedNotebook.id }));
      dispatch(simpleActionCreators.tags.addTags(tags));
      return updatedNotebook;
    });

actionCreators.loadNotebook = (notebookId) => (dispatch) =>
  jsonApi.find('notebooks', notebookId)
    .then(res => {
      dispatch(actionCreators.addNotebook(res.data));
      return res.data;
    });

actionCreators.loadNotebooksShallow = () => (dispatch) =>
  jsonApi.findAll('notebooks')
    .then(res => {
      dispatch(actionCreators.addNotebooks(res.data));
      return res.data;
    });

actionCreators.deleteNotebook = (notebookId) => (dispatch) =>
  jsonApi.destroy('notebooks', notebookId)
    .then(() => {
      dispatch(simpleActionCreators.tags.removeTagsFromNotebook(notebookId));
      dispatch(actionCreators.removeNotebook(notebookId));
    });


export default actionCreators;
