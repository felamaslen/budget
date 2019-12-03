import { SagaIterator } from '@redux-saga/core';
import { fork, select, takeLatest, take, call, put } from '@redux-saga/core/effects';
import axios from 'axios';
import { push } from 'connected-react-router';

import config from '~/config';
import { getLoggedIn } from '~/selectors/login';
import { errored } from '~/actions/app';
import { loggedIn, LoginRequestAction } from '~/actions/login';
import { getCurrentPathname } from '~/selectors/router';
import { ERRORED } from '~/constants/actions.rt';
import { LOGIN_REQUESTED, LOGGED_IN, LOGGED_OUT } from '~/constants/actions.app';

export function* onLoginToggle(): SagaIterator {
  const loggedInInitial = yield select(getLoggedIn);
  if (loggedInInitial) {
    yield take(LOGGED_OUT);
    return false;
  }

  while (true) {
    yield take([LOGGED_IN, ERRORED]);
    const isLoggedIn = yield select(getLoggedIn);
    if (isLoggedIn) {
      return true;
    }
  }
}

export function* attemptLogin({ pin }: LoginRequestAction): SagaIterator {
  try {
    const res = yield call<typeof axios>(axios, `${config.webUrl}/login`, {
      method: 'POST',
      data: {
        pin,
      },
    });

    yield put(loggedIn(res.data));
  } catch (err) {
    yield put(errored(err, LOGGED_IN));
  }
}

export function* attemptLogout() {
  try {
    yield call<typeof axios>(axios, `${config.webUrl}/logout`, {
      method: 'POST',
    });
  } catch (err) {
    yield call([console, 'warn'], 'Error logging out:', err.message);
  }
}

export function* watchLogout() {
  while (true) {
    const isLoggedIn = yield call(onLoginToggle);
    if (!isLoggedIn) {
      const currentPathname = yield select(getCurrentPathname);
      if (currentPathname !== '/') {
        yield put(push('/'));
      }
    }
  }
}

export default function* loginSaga(): SagaIterator {
  yield takeLatest(LOGIN_REQUESTED, attemptLogin);
  yield takeLatest(LOGGED_OUT, attemptLogout);
  yield fork(watchLogout);
}
