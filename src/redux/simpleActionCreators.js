/**
 * This file contains "simple" action creators. An action creator is
 * considered simple if it:
 *   - Returns a single action object
 *   - Doesn't call other action creators
 */

import { createActions } from 'redux-actions';


const simpleActionCreators = createActions({
  entities: {
    MERGE_ENTITIES: normalizedData => ({ normalizedData }),
    REMOVE_ENTITY: (type, id) => ({ type, id }),
    REMOVE_NOTEBOOK: notebookId => ({ notebookId }),
    REMOVE_TAGS_FROM_NOTEBOOK: notebookId => ({ notebookId }),
    ARRANGE_FRAMES_IN_GRID: notebookId => ({ notebookId }),
  },
  auth: {
    SET_AUTHENTICATED: authenticated => ({ authenticated }),
    SET_CURRENT_USER_API_KEYS: apiKeys => ({ apiKeys }),
    ADD_CURRENT_USER_API_KEYS: apiKeys => ({ apiKeys }),
    REMOVE_CURRENT_USER_API_KEY: apiKeyId => ({ apiKeyId }),
  }
});


export default simpleActionCreators;
