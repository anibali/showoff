import { createSelector } from '../../helpers/select';
import { getNotebookTags } from './tagSelectors';


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

export const getFlatNotebookWithTags = createSelector(
  [getNotebook, getNotebookTags],
  (notebook, tags) => Object.assign(
    {},
    notebook.attributes,
    { id: notebook.id },
    { tags: tags.map(tag => Object.assign({}, tag.attributes, { id: tag.id })) }
  ),
  (notebook, tags) => [notebook, tags.map(tag => tag.id).join(';')],
);
