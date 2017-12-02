import { createSelector } from '../../helpers/select';


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
