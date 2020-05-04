import sinon from 'sinon';

import reducer, { initialState } from './now';
import { timeUpdated } from '~client/actions/now';
import { loggedOut } from '~client/actions/login';

describe('Now reducer', () => {
  describe.each([
    ['Null action', null],
    ['LOGGED_OUT', loggedOut()],
  ])('%s', (_, action) => {
    it('should return the initial state', () => {
      expect.assertions(1);
      expect(reducer(undefined, action)).toStrictEqual(initialState);
    });
  });

  describe('TIME_UPDATED', () => {
    it('should update the state to the current time', () => {
      expect.assertions(1);
      const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03Z').getTime());

      const state = new Date('2019-06-10');
      const result = reducer(state, timeUpdated());

      expect(result).toStrictEqual(new Date('2019-07-04T18:03Z'));

      clock.restore();
    });

    it('should memoise the state with second precision', () => {
      expect.assertions(6);
      const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03:31.001Z'));

      const state = reducer(undefined, timeUpdated());

      expect(state).toStrictEqual(new Date('2019-07-04T18:03:31.001Z'));

      clock.tick(432);
      expect(reducer(state, timeUpdated())).toBe(state);

      clock.tick(566);
      expect(reducer(state, timeUpdated())).toBe(state);

      clock.tick(1);
      const next = reducer(state, timeUpdated());

      expect(next).not.toBe(state);
      expect(next).toStrictEqual(new Date('2019-07-04T18:03:32.000Z'));

      clock.tick(60000);
      expect(reducer(next, timeUpdated())).toStrictEqual(new Date('2019-07-04T18:04:32.000Z'));

      clock.restore();
    });
  });
});
