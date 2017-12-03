import _ from 'lodash';
import { select, takeEvery, all, call } from 'redux-saga/effects';

import simpleActionCreators from '../simpleActionCreators';
import apiClient from '../../helpers/apiClient';
import { serializeOne } from '../../helpers/entitySerDe';


const { arrangeFramesInGrid } = simpleActionCreators.entities;

const updateFrames = (frames) =>
  Promise.all(frames.map(frame =>
    apiClient.patch(
      `frames/${frame.id}`,
      {
        data: serializeOne('frames', frame, { pick: ['x', 'y', 'width', 'height'] })
      }
    )
  ));

function* saveNotebookFrames(action) {
  const state = yield select();

  const { notebookId } = action.payload;
  const relFrames = state.entities.notebooks[notebookId].relationships.frames.data;
  const frames = _.pick(state.entities.frames, relFrames.map(relFrame => relFrame.id));

  yield call(updateFrames, _.values(frames));
}

function* watchArrangeFramesInGrid() {
  yield takeEvery(arrangeFramesInGrid.toString(), saveNotebookFrames);
}

function* rootSaga() {
  yield all([
    watchArrangeFramesInGrid(),
  ]);
}


export default rootSaga;
