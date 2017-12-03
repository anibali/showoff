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
