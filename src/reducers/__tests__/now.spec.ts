import sinon from 'sinon';

import reducer from '~/reducers/now';
import { timeUpdated } from '~/actions/app';

test('TIME_UPDATED updates the state to the current time', () => {
  const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03Z').getTime());

  const state = new Date('2019-07-04T10:23Z');

  const result = reducer(state, timeUpdated());

  expect(result).toStrictEqual(new Date('2019-07-04T18:03Z'));

  clock.restore();
});

test('State is memoised with second precision', () => {
  const clock = sinon.useFakeTimers(new Date('2019-07-04T18:03:31.001Z'));

  const state = reducer(undefined, timeUpdated());

  expect(state).toStrictEqual(new Date('2019-07-04T18:03:31.001Z'));

  clock.tick(432);
  expect(reducer(state, timeUpdated())).toEqual(state);

  clock.tick(566);
  expect(reducer(state, timeUpdated())).toEqual(state);

  clock.tick(1);
  const next = reducer(state, timeUpdated());

  expect(next).not.toBe(state);
  expect(next).toStrictEqual(new Date('2019-07-04T18:03:32.000Z'));

  clock.tick(60000);
  expect(reducer(next, timeUpdated())).toStrictEqual(new Date('2019-07-04T18:04:32.000Z'));

  clock.restore();
});
