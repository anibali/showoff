import { handleActions, combineActions } from 'redux-actions';
import _ from 'lodash';
import simpleActionCreators from '../simpleActionCreators';


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


export default tagsReducer;
