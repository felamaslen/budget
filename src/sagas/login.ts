import { SagaIterator } from '@redux-saga/core';
import { fork, select, takeLatest, take, call, put } from '@redux-saga/core/effects';
import axios from 'axios';
import { push } from 'connected-react-router';

import config from '~/config';
import { getLoggedIn } from '~/selectors/login';
import { errored } from '~/actions/app';
import { loggedIn, LoginRequestAction } from '~/actions/login';
import { overviewRead } from '~/actions/overview';
import { getCurrentPathname } from '~/selectors/router';
import { ERRORED } from '~/constants/actions.rt';
import { LOGIN_REQUESTED, LOGGED_IN, LOGGED_OUT, SOCKET_READY } from '~/constants/actions.app';

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

export function* attemptLogout(): SagaIterator {
  try {
    yield call<typeof axios>(axios, `${config.webUrl}/logout`, {
      method: 'POST',
    });
  } catch (err) {
    yield call([console, 'warn'], 'Error logging out:', err.message);
  }
}

export function* onLogin(initialLoad: boolean): SagaIterator {
  yield take(SOCKET_READY);

  if (!initialLoad) {
    yield put(overviewRead());
  }
}

export function* watchLoginStatus(): SagaIterator {
  let isLoggedIn = yield select(getLoggedIn);
  let wasLoggedIn = false;

  while (true) {
    if (isLoggedIn) {
      yield fork(onLogin, !wasLoggedIn);
      wasLoggedIn = true;
    } else {
      const currentPathname = yield select(getCurrentPathname);
      if (currentPathname !== '/') {
        yield put(push('/'));
      }
    }

    isLoggedIn = yield call(onLoginToggle);
  }
}

export default function* loginSaga(): SagaIterator {
  yield takeLatest(LOGIN_REQUESTED, attemptLogin);
  yield takeLatest(LOGGED_OUT, attemptLogout);
  yield fork(watchLoginStatus);
}
