import { SagaIterator } from '@redux-saga/core';
import { fork, delay, put } from '@redux-saga/core/effects';
import loginSaga from '~/sagas/login';
import ioSaga from '~/sagas/io';
import { timeUpdated } from '~/actions/app';

function* updateTime(): SagaIterator {
  while (true) {
    yield delay(5000);
    yield put(timeUpdated());
  }
}

export default function* rootSaga(): SagaIterator {
  yield fork(updateTime);
  yield fork(ioSaga);
  yield fork(loginSaga);
}
