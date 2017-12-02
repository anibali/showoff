import _ from 'lodash';

import { createSelector } from '../../helpers/select';


export const getTags = createSelector(
  [],
  state => state.entities.tags
);

export const getNotebookTags = createSelector(
  [
    state => getTags(state),
    (state, notebookId) => notebookId,
  ],
  (tags, notebookId) =>
    _.filter(_.values(tags), tag => tag.relationships.notebook.data.id === notebookId)
);

export const getTagNames = createSelector(
  [getTags],
  (tags) => _.uniqBy(_.values(tags).map(tag => _.pick(tag.attributes, ['name'])), 'name'),
);
