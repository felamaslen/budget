import {
  dataRead,
  syncRequested,
  syncLocked,
  syncUnlocked,
  syncReceived,
  syncErrorOccurred,
  loggedIn,
  loggedOut,
} from '~client/actions';
import reducer, { initialState } from '~client/reducers/api';
import { testResponse } from '~client/test-data';

describe('API reducer', () => {
  describe('LOGGED_IN', () => {
    it('LOGGED_IN sets user details and initial loading', () => {
      expect.assertions(2);
      const action = loggedIn({
        name: 'someone',
        uid: 'some-long-id',
        apiKey: 'some-api-key',
        expires: '2019-07-31T23:08:26.442+01:00',
      });
      const result = reducer(initialState, action);

      expect(result.key).toBe('some-api-key');
      expect(result.initialLoading).toBe(true);
    });
  });

  describe('LOGGED_OUT', () => {
    it('LOGGED_OUT resets the state', () => {
      expect.assertions(1);
      expect(reducer(undefined, loggedOut())).toStrictEqual(initialState);
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
  });

  describe('SYNC_REQUESTED', () => {
    it('SYNC_REQUESTED sets loading to true', () => {
      expect.assertions(1);
      const action = syncRequested();

      const result = reducer(initialState, action);

      expect(result.loading).toBe(true);
    });
  });

  describe('SYNC_LOCKED', () => {
    it('SYNC_LOCKED locks the state', () => {
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
    it('SYNC_UNLOCKED unlocks the state', () => {
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
    it('SYNC_RECEIVED sets loading to false', () => {
      expect.assertions(2);
      const action = syncReceived({ list: [], netWorth: [] });
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('SYNC_ERROR_OCCURRED', () => {
    it('SYNC_ERROR_OCCURRED sets the error', () => {
      expect.assertions(2);
      const err = new Error('something bad happened');
      const action = syncErrorOccurred([], err);
      const result = reducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(err);
    });
  });
});
