/* eslint-disable @typescript-eslint/explicit-function-return-type */
import axios from 'axios';
import { fork, takeLatest, put, call } from 'redux-saga/effects';

import {
  ActionTypeLogin,
  ActionLoginRequested,
  loginErrorOccurred,
  loginRequested,
  loggedIn,
  loggedOut,
  errorOpened,
} from '~client/actions';
import { API_PREFIX } from '~client/constants/data';

export function* onLoginAttempt({ pin }: ActionLoginRequested) {
  try {
    const res = yield call(axios.post, `${API_PREFIX}/user/login`, { pin });

    yield call([localStorage, 'setItem'], 'pin', String(pin));
    yield put(loggedIn(res.data));
  } catch (err) {
    if (err.response) {
      const message = `Login error: ${err.response.data.err}`;

      yield put(errorOpened(message));
    }

    yield put(loginErrorOccurred(err.message));
    yield put(loggedOut());
  }
}

export function* onLogout() {
  yield call([localStorage, 'removeItem'], 'pin');
}

export function* autoLogin() {
  let loginAttempted = false;
  try {
    const pinRaw = yield call([localStorage, 'getItem'], 'pin');
    const pin = Number(JSON.parse(pinRaw)) || 0;

    if (pin) {
      yield put(loginRequested(pin));
      loginAttempted = true;
    }
  } catch {
    // do nothing
  } finally {
    if (!loginAttempted) {
      yield put(loggedOut());
    }
  }
}

export default function* loginSaga() {
  yield takeLatest(ActionTypeLogin.Requested, onLoginAttempt);
  yield takeLatest(ActionTypeLogin.LoggedOut, onLogout);

  yield fork(autoLogin);
}
