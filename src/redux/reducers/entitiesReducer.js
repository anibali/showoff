import { handleActions } from 'redux-actions';
import _ from 'lodash';
import { freeze, merge, assign, dissoc } from 'icepick';

import simpleActionCreators from '../simpleActionCreators';


const defaultState = freeze({
  notebooks: {},
  tags: {},
  frames: {},
});

const {
  mergeEntities,
  removeEntity,
  removeNotebook,
  removeTagsFromNotebook,
  arrangeFramesInGrid,
} = simpleActionCreators.entities;

const entitiesReducer = handleActions({
  [mergeEntities](state, { payload: { normalizedData } }) {
    return merge(state, normalizedData);
  },
  [removeEntity](state, { payload: { type, id } }) {
    return assign(state, { [type]: dissoc(state[type], id) });
  },
  [removeNotebook](state, { payload: { notebookId } }) {
    const notebooks = dissoc(state.notebooks, notebookId);
    const tags = _.keyBy(
      _.filter(state.tags, tag => tag.relationships.notebook.data.id !== notebookId),
      'id'
    );
    const frames = _.keyBy(
      _.filter(state.frames, frame => frame.relationships.notebook.data.id !== notebookId),
      'id'
    );
    return assign(state, { notebooks, tags, frames });
  },
  [removeTagsFromNotebook](state, { payload: { notebookId } }) {
    const tagIds = _.filter(
      _.values(state.tags),
      tag => tag.relationships.notebook.data.id === notebookId
    ).map(tag => tag.id);
    return assign(state, { tags: _.omit(state.tags, tagIds) });
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
      return merge(frame, { attributes: { x, y, width, height } });
    });

    return merge(state, { frames: _.keyBy(updatedFrames, 'id') });
  },
}, defaultState);


export default entitiesReducer;
