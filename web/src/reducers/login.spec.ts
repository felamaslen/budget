import reducer, { initialState } from '~client/reducers/login';
import { loginRequested, loginErrorOccurred, loggedIn, loggedOut } from '~client/actions/login';

describe('Login reducer', () => {
  describe('Null action', () => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, null)).toStrictEqual(initialState);
    });
  });

  describe('LOGGED_OUT', () => {
    const action = loggedOut();

    it('should set initialised to true', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual({ ...initialState, initialised: true });
    });
  });

  describe('LOGIN_REQUESTED', () => {
    const action = loginRequested(1234);

    it('should set loading to true', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(true);
    });
  });

  describe('LOGIN_ERROR_OCCURRED', () => {
    const err = new Error('bad pin or something');
    const action = loginErrorOccurred(err);

    it('should set error to true and loading to false', () => {
      expect.assertions(3);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(err);
      expect(result.initialised).toBe(true);
    });
  });

  describe('LOGGED_IN', () => {
    const action = loggedIn({
      name: 'someone',
      uid: 'some-long-id',
      apiKey: 'some-api-key',
      expires: '2019-07-31T23:08:26.442+01:00',
    });

    it('should set the user details', () => {
      expect.assertions(5);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();

      expect(result.uid).toBe('some-long-id');
      expect(result.name).toBe('someone');
      expect(result.initialised).toBe(true);
    });
  });
});
