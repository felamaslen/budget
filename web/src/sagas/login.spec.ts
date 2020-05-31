import nock from 'nock';
import { testSaga, expectSaga } from 'redux-saga-test-plan';

import loginSaga, { onLoginAttempt, onLogout, autoLogin } from './login';
import {
  ActionTypeLogin,
  loginErrorOccurred,
  loginRequested,
  loggedIn,
  loggedOut,
  errorOpened,
} from '~client/actions';
import { testLoginResponse } from '~client/test-data';

jest.mock('shortid', () => ({
  generate: (): string => 'some-fake-id',
}));

describe('Login saga', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

  beforeAll(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation();
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation();
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation();
  });

  afterEach(() => {
    getItemSpy.mockReset();
    setItemSpy.mockReset();
    removeItemSpy.mockReset();
  });

  describe('onLoginAttempt', () => {
    it('should try to log in', async () => {
      expect.assertions(3);

      const loginScope = nock('http://localhost')
        .post('/api/v4/user/login', {
          pin: 1024,
        })
        .reply(200, testLoginResponse);

      await expectSaga(onLoginAttempt, loginRequested(1024)).put(loggedIn(testLoginResponse)).run();

      expect(loginScope.isDone()).toBe(true);
      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(setItemSpy).toHaveBeenCalledWith('pin', JSON.stringify(1024));
    });

    it('should display errors', async () => {
      expect.assertions(2);

      const loginScope = nock('http://localhost')
        .post('/api/v4/user/login', {
          pin: 1024,
        })
        .reply(500, { err: 'foo' });

      await expectSaga(onLoginAttempt, loginRequested(1024))
        .put(errorOpened('Login error: foo'))
        .put(loginErrorOccurred('Request failed with status code 500'))
        .put(loggedOut())
        .run();

      expect(loginScope.isDone()).toBe(true);
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });

  describe('onLogout', () => {
    it('should reset saved credentials', () => {
      expect.assertions(0);
      testSaga(onLogout).next().call([localStorage, 'removeItem'], 'pin').next().isDone();
    });
  });

  describe('autoLogin', () => {
    it('should try to log in automatically', async () => {
      expect.assertions(1);
      getItemSpy.mockImplementationOnce((): string => '1234');

      await expectSaga(autoLogin).put(loginRequested(1234)).run();

      expect(getItemSpy).toHaveBeenCalledWith('pin');
    });

    it('should handle bad values stored in localStorage', async () => {
      expect.assertions(0);

      getItemSpy.mockResolvedValueOnce('not a number');

      await expectSaga(autoLogin).put(loggedOut()).run();
    });
  });

  it('should yield other sagas', () => {
    expect.assertions(0);
    testSaga(loginSaga)
      .next()
      .takeLatest(ActionTypeLogin.Requested, onLoginAttempt)
      .next()
      .takeLatest(ActionTypeLogin.LoggedOut, onLogout)
      .next()
      .fork(autoLogin)
      .next()
      .isDone();
  });
});
