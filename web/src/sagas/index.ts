/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fork } from 'redux-saga/effects';

import analysis from '~client/sagas/analysis';
import app from '~client/sagas/app';
import crud from '~client/sagas/crud';
import funds from '~client/sagas/funds';

export default function* rootSaga() {
  yield fork(app);
  yield fork(crud);
  yield fork(analysis);
  yield fork(funds);
}
