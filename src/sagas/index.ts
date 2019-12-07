import { SagaIterator } from '@redux-saga/core';
import { fork } from '@redux-saga/core/effects';
import loginSaga from '~/sagas/login';
import ioSaga from '~/sagas/io';

export default function* rootSaga(): SagaIterator {
  yield fork(ioSaga);
  yield fork(loginSaga);
}
