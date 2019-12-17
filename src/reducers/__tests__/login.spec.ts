import reducer, { LoginState } from '~/reducers/login';

import { ErrorAction } from '~/types/actions';

import {
  LoginRequestAction,
  LoggedInAction,
  loginRequested,
  loggedIn,
  loggedOut,
  LoggedOutAction,
} from '~/actions/login';

import { ERRORED } from '~/constants/actions.rt';

import { LOGGED_IN } from '~/constants/actions.app';

test('LOGIN_REQUESTED sets loading and error state', () => {
  const state: LoginState = {
    loading: false,
  };

  const action: LoginRequestAction = loginRequested('1234');

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    loading: true,
  });
});

test('LOGGED_IN sets user info', () => {
  const state = {
    loading: true,
  };

  const action: LoggedInAction = loggedIn({
    uid: 'my-user-id',
    name: 'My Name',
    token: 'my-token',
  });

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    loading: false,
    uid: 'my-user-id',
    name: 'My Name',
    token: 'my-token',
  });
});

test('ERRORED (from socket) sets error', () => {
  const state = {
    loading: true,
    uid: 'my-user-id',
    name: 'My Name',
    token: 'my-token',
  };

  const action: ErrorAction = {
    type: ERRORED,
    __FROM_SOCKET__: true,
    actionType: LOGGED_IN,
    payload: {
      error: 'Invalid credentials',
    },
  };

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    loading: false,
    error: 'Invalid credentials',
  });
});

test('LOGGED_OUT resets the state', () => {
  const state = {
    loading: false,
    uid: 'my-user-id',
    name: 'My Name',
    token: 'my-token',
  };

  const action: LoggedOutAction = loggedOut();

  const result = reducer(state, action);

  expect(result).toStrictEqual({
    loading: false,
  });
});
