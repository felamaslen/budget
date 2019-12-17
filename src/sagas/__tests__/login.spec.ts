import { testSaga } from 'redux-saga-test-plan';
import axios from 'axios';
import { push } from 'connected-react-router';

import config from '~/config';
import { getLoggedIn } from '~/selectors/login';
import { errored } from '~/actions/app';
import { loginRequested, loggedIn, LoginResponsePayload } from '~/actions/login';
import { getCurrentPathname } from '~/selectors/router';
import { ERRORED } from '~/constants/actions.rt';
import { LOGIN_REQUESTED, LOGGED_IN, LOGGED_OUT } from '~/constants/actions.app';

import loginSaga, {
  onLoginToggle,
  attemptLogin,
  attemptLogout,
  onLogin,
  watchLoginStatus,
} from '~/sagas/login';

test('onLoginToggle waits for login status', () => {
  testSaga(onLoginToggle)
    .next()
    .select(getLoggedIn)
    .next(false)
    .take([LOGGED_IN, ERRORED])
    .next()
    .select(getLoggedIn)
    .next(false)
    .take([LOGGED_IN, ERRORED])
    .next()
    .select(getLoggedIn)
    .next(true)
    .returns(true);

  testSaga(onLoginToggle)
    .next()
    .select(getLoggedIn)
    .next(true)
    .take(LOGGED_OUT)
    .next()
    .returns(false);
});

test('attemptLogin makes a POST request', () => {
  const responseData: LoginResponsePayload = {
    uid: 'some-uid',
    name: 'My Name',
    token: 'some-token',
  };

  const res = {
    data: responseData,
    status: 200,
    statusText: 'OK',
    headers: {},
  };

  testSaga(attemptLogin, loginRequested('1234'))
    .next()
    .call(axios, `${config.webUrl}/login`, {
      method: 'POST',
      data: {
        pin: '1234',
      },
    })
    .next(res)
    .put(loggedIn(responseData))
    .next()
    .isDone();
});

test('attemptLogin handles errors', () => {
  const err = new Error('Invalid PIN');

  testSaga(attemptLogin, loginRequested('1234'))
    .next()
    .call(axios, `${config.webUrl}/login`, {
      method: 'POST',
      data: {
        pin: '1234',
      },
    })
    .throw(err)
    .put(errored(err, LOGGED_IN))
    .next()
    .isDone();
});

test('watchLoginStatus redirects to / if not logged in', () => {
  testSaga(watchLoginStatus)
    .next()
    .select(getLoggedIn)
    .next(false)
    .select(getCurrentPathname)
    .next('/')
    .call(onLoginToggle)
    .next(true)
    .fork(onLogin)
    .next()
    .call(onLoginToggle)
    .next(true)
    .fork(onLogin)
    .next()
    .call(onLoginToggle)
    .next(false)
    .select(getCurrentPathname)
    .next('/')
    .call(onLoginToggle)
    .next(false)
    .select(getCurrentPathname)
    .next('/some-page')
    .put(push('/'))
    .next()
    .call(onLoginToggle);
});

test('loginSaga forks other sagas', () => {
  testSaga(loginSaga)
    .next()
    .takeLatest(LOGIN_REQUESTED, attemptLogin)
    .next()
    .takeLatest(LOGGED_OUT, attemptLogout)
    .next()
    .fork(watchLoginStatus)
    .next()
    .isDone();
});
