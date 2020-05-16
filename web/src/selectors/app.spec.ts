import { getLoggedIn, getWindowWidth } from './app';
import { testState } from '~client/test-data/state';

describe('App selectors', () => {
  describe('getLoggedIn', () => {
    it('should return true if there is an API key and a user ID', () => {
      expect.assertions(1);
      expect(
        getLoggedIn({
          ...testState,
          api: {
            ...testState.api,
            key: 'some-api-key',
          },
          login: {
            ...testState.login,
            uid: 'some-user-id',
          },
        }),
      ).toBe(true);
    });
    it('should return false if there is no API key', () => {
      expect.assertions(1);
      expect(
        getLoggedIn({
          ...testState,
          api: {
            ...testState.api,
            key: null,
          },
          login: {
            ...testState.login,
            uid: 'some-user-id',
          },
        }),
      ).toBe(false);
    });
    it('should return false if there is no user ID', () => {
      expect.assertions(1);
      expect(
        getLoggedIn({
          ...testState,
          api: {
            ...testState.api,
            key: 'some-api-key',
          },
          login: {
            ...testState.login,
            uid: null,
          },
        }),
      ).toBe(false);
    });
  });

  describe('getWindowWidth', () => {
    it('should return the window width', () => {
      expect.assertions(1);
      expect(
        getWindowWidth({
          ...testState,
          app: {
            windowWidth: 301,
          },
        }),
      ).toBe(301);
    });
  });
});
