/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { fork } from 'redux-saga/effects';

import analysis from '~client/sagas/analysis';
import app from '~client/sagas/app';
import crud from '~client/sagas/crud';
import error from '~client/sagas/error';
import funds from '~client/sagas/funds';
import login from '~client/sagas/login';
import now from '~client/sagas/now';

export default function* rootSaga() {
  yield fork(now);
  yield fork(app);
  yield fork(error);
  yield fork(login);
  yield fork(crud);
  yield fork(analysis);
  yield fork(funds);
}
