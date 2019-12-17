import addSeconds from 'date-fns/addSeconds';

import state from '~/__tests__/state';

import { getNow, getCurrentDate } from '~/selectors/now';

test('getNow gets the current time from the state', () => {
  expect(
    getNow({
      now: new Date('2019-11-10'),
    }),
  ).toStrictEqual(new Date('2019-11-10'));
});

test('getCurrentDate gets the end of the current day', () => {
  expect(
    getCurrentDate({
      now: new Date('2018-03-23T11:53:23Z'),
    }),
  ).toStrictEqual(new Date('2018-03-23T23:59:59.999Z'));
});

test("getCurrentDate does not reload the result if the day doesn't change", () => {
  const result = getCurrentDate(state);

  const nextResult = getCurrentDate({ ...state, now: addSeconds(state.now, 3) });

  // notice this equality check is shallow, i.e. by reference, so if the date had
  // been recalculated, this test would fail :)
  expect(nextResult).toBe(result);
});
