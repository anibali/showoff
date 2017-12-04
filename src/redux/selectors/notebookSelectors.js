import _ from 'lodash';

import { createSelector } from '../../helpers/select';
import { getTags } from './tagSelectors';


export const getNotebooks = createSelector(
  [],
  state => state.entities.notebooks
);

export const getNotebook = createSelector(
  [
    state => getNotebooks(state),
    (state, id) => id,
  ],
  (notebooks, id) => notebooks[id],
);

export const getFilteredNotebooks = createSelector(
  [
    state => getNotebooks(state),
    state => getTags(state),
    (state, tagNames) => tagNames,
  ],
  (notebooks, tags, tagNames) => {
    const tagsByName = _.groupBy(tags, tag => tag.attributes.name);
    const hasTag = (notebook, tagName) =>
      _.findIndex(
        tagsByName[tagName],
        tag => tag.relationships.notebook.data.id === notebook.id
      ) !== -1;
    return _.filter(notebooks, notebook =>
      tagNames.reduce((acc, tagName) => acc && hasTag(notebook, tagName), true)
    );
  }
);
