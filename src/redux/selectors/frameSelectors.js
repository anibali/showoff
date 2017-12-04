import _ from 'lodash';

import { createSelector } from '../../helpers/select';


export const getFrames = createSelector(
  [],
  state => state.entities.frames
);

export const getFrame = createSelector(
  [
    state => getFrames(state),
    (state, id) => id,
  ],
  (frames, id) => frames[id],
);

export const getFrameFlat = createSelector(
  [getFrame],
  frame => Object.assign({}, frame.attributes, { id: frame.id })
);

export const getNotebookFrames = createSelector(
  [
    state => getFrames(state),
    (state, notebookId) => notebookId,
  ],
  (frames, notebookId) =>
    _.filter(frames, frame => frame.relationships.notebook.data.id === notebookId)
);
