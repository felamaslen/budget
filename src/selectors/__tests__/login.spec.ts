import { LoginSlice, getToken, getLoggedIn } from '~/selectors/login';
import { PreloadedState } from '~/reducers';

test('getToken gets the token from the state', () => {
  const state: LoginSlice = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getToken(state)).toBe('my-token');
});

test('getLoggedIn returns true iff there is a token in state', () => {
  const stateLoggedIn: LoginSlice = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getLoggedIn(stateLoggedIn)).toBe(true);

  const stateLoggedOut: LoginSlice = {
    login: {
      loading: false,
    },
  };

  expect(getLoggedIn(stateLoggedOut)).toBe(false);
});
