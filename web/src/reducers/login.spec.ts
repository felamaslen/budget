import numericHash from 'string-hash';
import {
  loginRequested,
  loginErrorOccurred,
  loggedIn,
  loggedOut,
  ActionTypeLogin,
} from '~client/actions';
import reducer, { initialState } from '~client/reducers/login';

describe('Login reducer', () => {
  describe(ActionTypeLogin.LoggedOut, () => {
    const action = loggedOut();

    it('should set initialised to true', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual({ ...initialState, initialised: true });
    });
  });

  describe(ActionTypeLogin.Requested, () => {
    const action = loginRequested(1234);

    it('should set loading to true', () => {
      expect.assertions(1);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(true);
    });
  });

  describe(ActionTypeLogin.ErrorOccurred, () => {
    const err = new Error('bad pin or something');
    const action = loginErrorOccurred(err.message);

    it('should set error to true and loading to false', () => {
      expect.assertions(3);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(err.message);
      expect(result.initialised).toBe(true);
    });
  });

  describe(ActionTypeLogin.LoggedIn, () => {
    const action = loggedIn({
      name: 'someone',
      uid: numericHash('some-long-id'),
      apiKey: 'some-api-key',
      expires: '2019-07-31T23:08:26.442+01:00',
    });

    it('should set the user details', () => {
      expect.assertions(5);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();

      expect(result.uid).toBe(numericHash('some-long-id'));
      expect(result.name).toBe('someone');
      expect(result.initialised).toBe(true);
    });
  });
});
