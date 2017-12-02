import { handleActions } from 'redux-actions';
import _ from 'lodash';

import simpleActionCreators from '../simpleActionCreators';
import merge from '../../helpers/immutableMerge';


const defaultState = {
  notebooks: {},
  tags: {},
  frames: {},
};

const {
  mergeEntities,
  removeEntity,
  removeTagsFromNotebook,
} = simpleActionCreators.entities;

const entitiesReducer = handleActions({
  [mergeEntities](state, { payload: { normalizedData } }) {
    return merge({}, state, normalizedData);
  },
  [removeEntity](state, { payload: { type, id } }) {
    return _.assign({}, state, { [type]: _.omit(state[type], id) });
  },
  [removeTagsFromNotebook](state, { payload: { notebookId } }) {
    const tagIds = _.filter(
      _.values(state.tags),
      tag => tag.relationships.notebook.data.id === notebookId
    ).map(tag => tag.id);
    return _.assign({}, state, { tags: _.omit(state.tags, tagIds) });
  },
}, defaultState);


export default entitiesReducer;
