import { fork } from '@redux-saga/core/effects';
import loginSaga from '~/sagas/login';
import ioSaga from '~/sagas/io';

export default function* rootSaga() {
  yield fork(ioSaga);
  yield fork(loginSaga);
}
