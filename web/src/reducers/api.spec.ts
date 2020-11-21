import {
  dataRead,
  syncRequested,
  syncLocked,
  syncUnlocked,
  syncReceived,
  syncErrorOccurred,
  ActionTypeLogin,
  loggedOut,
  apiKeySet,
} from '~client/actions';
import reducer, { initialState } from '~client/reducers/api';
import { testResponse } from '~client/test-data';

describe('API reducer', () => {
  describe(ActionTypeLogin.ApiKeySet, () => {
    it('should set the API key in state', () => {
      expect.assertions(1);
      expect(reducer(initialState, apiKeySet('my-new-api-key'))).toHaveProperty(
        'key',
        'my-new-api-key',
      );
    });
  });

  describe(ActionTypeLogin.LoggedOut, () => {
    it('should reset the state while keeping initialLoading=false', () => {
      expect.assertions(1);
      expect(reducer(undefined, loggedOut())).toStrictEqual({
        ...initialState,
        initialLoading: false,
      });
    });
  });

  describe('DATA_READ', () => {
    const action = dataRead(testResponse);
    const state = { ...initialState, initialLoading: true };

    it('should set initial loading to false', () => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual(expect.objectContaining({ initialLoading: false }));
    });

    it.each`
      prop            | key            | value
      ${'birth date'} | ${'birthDate'} | ${new Date('1996-02-03')}
    `('should set the $prop app config property', ({ key, value }) => {
      expect.assertions(1);
      const result = reducer(state, action);

      expect(result).toStrictEqual(
        expect.objectContaining({
          appConfig: expect.objectContaining({
            [key]: value,
          }),
        }),
      );
    });
  });

  describe('SYNC_REQUESTED', () => {
    it('should set loading to true', () => {
      expect.assertions(1);
      const action = syncRequested();

      const result = reducer(initialState, action);

      expect(result.loading).toBe(true);
    });
  });

  describe('SYNC_LOCKED', () => {
    it('should lock the state', () => {
      expect.assertions(2);
      const action = syncLocked();

      expect(reducer({ ...initialState, locked: false }, action)).toStrictEqual(
        expect.objectContaining({ locked: true }),
      );
      expect(reducer({ ...initialState, locked: true }, action)).toStrictEqual(
        expect.objectContaining({ locked: true }),
      );
    });
  });

  describe('SYNC_UNLOCKED', () => {
    it('should unlock the state', () => {
      expect.assertions(2);
      const action = syncUnlocked();

      expect(reducer({ ...initialState, locked: false }, action)).toStrictEqual(
        expect.objectContaining({ locked: false }),
      );
      expect(reducer({ ...initialState, locked: true }, action)).toStrictEqual(
        expect.objectContaining({ locked: false }),
      );
    });
  });

  describe('SYNC_RECEIVED', () => {
    it('should set loading to false', () => {
      expect.assertions(2);
      const action = syncReceived({ list: [], netWorth: [] });
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('SYNC_ERROR_OCCURRED', () => {
    it('should set the error', () => {
      expect.assertions(2);
      const err = new Error('something bad happened');
      const action = syncErrorOccurred([], err);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(err);
    });
  });
});
