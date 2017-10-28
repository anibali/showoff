const { handleActions, combineActions } = require('redux-actions');

const _ = require('lodash');
const simpleActionCreators = require('../simpleActionCreators');


const defaultState = [];

const {
  addTag,
  addTags,
  removeTagsFromNotebook,
} = simpleActionCreators.tags;

const tagsReducer = handleActions({
  [combineActions(addTag, addTags)](state, { payload: { tags } }) {
    const newState = _.clone(state);

    tags.forEach((tag) => {
      const tagIndex = _.findIndex(state, { id: tag.id });

      if(tagIndex < 0) {
        newState.push(tag);
      } else {
        newState[tagIndex] = _.assign({}, newState[tagIndex], tag);
      }
    });

    return newState;
  },
  [removeTagsFromNotebook](state, { payload: { notebookId } }) {
    return _.reject(state, { notebookId });
  },
}, defaultState);


module.exports = tagsReducer;
