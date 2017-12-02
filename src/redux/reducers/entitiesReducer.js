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
  arrangeFramesInGrid,
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
  [arrangeFramesInGrid](state, { payload: { notebookId } }) {
    const unsortedFrames = _.filter(
      _.values(state.frames),
      frame => frame.relationships.notebook.data.id === notebookId
    );
    const frames = _.sortBy(unsortedFrames, 'createdAt');

    const width = 460;
    const height = 320;

    const updatedFrames = frames.map((frame, i) => {
      const x = (i % 4) * width;
      const y = Math.floor(i / 4) * height;
      return merge({}, frame, { attributes: { x, y, width, height } });
    });

    return merge({}, state, { frames: _.keyBy(updatedFrames, 'id') });
  },
}, defaultState);


export default entitiesReducer;
