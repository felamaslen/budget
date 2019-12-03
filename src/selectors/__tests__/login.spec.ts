import { getToken, getLoggedIn } from '~/selectors/login';
import { GlobalState } from '~/reducers';

test('getToken gets the token from the state', () => {
  const state: GlobalState = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getToken(state)).toBe('my-token');
});

test('getLoggedIn returns true iff there is a token in state', () => {
  const stateLoggedIn: GlobalState = {
    login: {
      loading: false,
      token: 'my-token',
    },
  };

  expect(getLoggedIn(stateLoggedIn)).toBe(true);

  const stateLoggedOut: GlobalState = {
    login: {
      loading: false,
    },
  };

  expect(getLoggedIn(stateLoggedOut)).toBe(false);
});
