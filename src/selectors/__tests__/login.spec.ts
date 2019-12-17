import { State, getToken, getLoggedIn } from '~/selectors/login';

test('getToken gets the token from the state', () => {
  const state: State = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getToken(state)).toBe('my-token');
});

test('getLoggedIn returns true iff there is a token in state', () => {
  const stateLoggedIn: State = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getLoggedIn(stateLoggedIn)).toBe(true);

  const stateLoggedOut: State = {
    login: {
      loading: false,
    },
  };

  expect(getLoggedIn(stateLoggedOut)).toBe(false);
});
