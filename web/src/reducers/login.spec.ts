import reducer, { initialState } from '~client/reducers/login';
import { loginRequested, loginErrorOccurred, loggedIn, loggedOut } from '~client/actions/login';

describe('Login reducer', () => {
  it('Null action returns the initial state', () => {
    expect(reducer(undefined, null)).toBe(initialState);
  });

  it('LOGGED_OUT sets initialised to true', () => {
    expect(reducer(undefined, loggedOut())).toStrictEqual({ ...initialState, initialised: true });
  });

  it('LOGIN_REQUESTED sets loading to true', () => {
    const action = loginRequested('1234');
    const result = reducer(initialState, action);

    expect(result.loading).toBe(true);
  });

  it('LOGIN_ERROR_OCCURRED sets error to true and loading to false', () => {
    const err = new Error('bad pin or something');

    const action = loginErrorOccurred(err);
    const result = reducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.error).toBe(err);
    expect(result.initialised).toBe(true);
  });

  it('LOGGED_IN sets user details', () => {
    const action = loggedIn({
      name: 'someone',
      uid: 'some-long-id',
      apiKey: 'some-api-key',
      expires: '2019-07-31T23:08:26.442+01:00',
    });
    const result = reducer(initialState, action);

    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();

    expect(result.uid).toBe('some-long-id');
    expect(result.name).toBe('someone');
    expect(result.initialised).toBe(true);
  });
});
