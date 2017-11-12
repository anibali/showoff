/**
 * This file contains "simple" action creators. An action creator is
 * considered simple if it:
 *   - Returns a single action object
 *   - Doesn't call other action creators
 */

import { createActions } from 'redux-actions';


const simpleActionCreators = createActions({
  notebooks: {
    MODIFY_FRAME: frame => ({ frame }),
    ADD_NOTEBOOK: notebook => ({ notebooks: [notebook] }),
    ADD_NOTEBOOKS: notebooks => ({ notebooks }),
    REMOVE_NOTEBOOK: notebookId => ({ notebookId }),
  },
  tags: {
    ADD_TAG: tag => ({ tags: [tag] }),
    ADD_TAGS: tags => ({ tags }),
    REMOVE_TAGS_FROM_NOTEBOOK: notebookId => ({ notebookId }),
  },
  auth: {
    SET_AUTHENTICATED: authenticated => ({ authenticated }),
  }
});


export default simpleActionCreators;
