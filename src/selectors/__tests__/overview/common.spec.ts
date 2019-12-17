import state from '~/__tests__/state';

import {
  getMonthCost,
  getSummary,
  getStartDate,
  getOldMonths,
  getPastMonths,
  getFutureMonths,
  getViewStartDate,
  getEndDate,
  getNumMonths,
  getMonthDates,
} from '~/selectors/overview/common';

test('getMonthCost gets the map of costs (including income)', () => {
  expect.assertions(1);
  expect(getMonthCost(state)).toStrictEqual({
    income: [2000, 1900, 1500, 2500, 2300, 1800],
    bills: [1000, 900, 400, 1300, 2700],
    food: [50, 13, 20],
    general: [150, 90, 10],
    holiday: [10, 1000, 95],
    social: [50, 65, 134],
  });
});

test('getSummary gets the summary value map', () => {
  expect.assertions(1);
  expect(getSummary(state)).toStrictEqual({
    netWorth: [193, 9913, -2123, 10312, 89137, 93128, 10913],
    funds: [94004, 105390, 110183, 100779, 101459, 102981, 103293],
    fundCosts: [100000, 99000, 100000, 100000, 110000, 110000 + 56123, 110000 + 56123 - 2382],
    income: [2000, 1900, 1500, 2500, 2300, 1800],
    bills: [1000, 900, 400, 1300, 2700],
    food: [50, 13, 20],
    general: [150, 90, 10],
    holiday: [10, 1000, 95],
    social: [50, 65, 134],
  });
});

const stateAtMonthStart = { ...state, now: new Date('2018-03-01T00:00:00.000Z') };
const stateAtMonthEnd = { ...state, now: new Date('2018-03-31T23:59:59.999Z') };

test('getStartDate gets the start date', () => {
  expect.assertions(3);
  expect(getStartDate(state)).toStrictEqual(new Date('2017-09-30T23:59:59.999Z'));
  expect(getStartDate(stateAtMonthStart)).toStrictEqual(getStartDate(state));
  expect(getStartDate(stateAtMonthEnd)).toStrictEqual(getStartDate(state));
});

test('getViewStartDate gets the view start date', () => {
  expect.assertions(3);
  expect(getViewStartDate(state)).toStrictEqual(new Date('2018-01-31T23:59:59.999Z'));
  expect(getViewStartDate(stateAtMonthStart)).toStrictEqual(getViewStartDate(state));
  expect(getViewStartDate(stateAtMonthEnd)).toStrictEqual(getViewStartDate(state));
});

test('getOldMonths gets the number of obsolete months', () => {
  expect.assertions(3);
  expect(getOldMonths(state)).toBe(4); // sep-17 to dec-17
  expect(getOldMonths(stateAtMonthStart)).toBe(getOldMonths(state));
  expect(getOldMonths(stateAtMonthEnd)).toBe(getOldMonths(state));
});

test('getPastMonths gets the past months number', () => {
  expect.assertions(3);
  expect(getPastMonths(state)).toBe(2); // jan-18 to feb-18
  expect(getPastMonths(stateAtMonthStart)).toBe(getPastMonths(state));
  expect(getPastMonths(stateAtMonthEnd)).toBe(getPastMonths(state));
});

test('getPastMonths changes when the state time updates', () => {
  expect.assertions(4);
  expect(getPastMonths({ ...state, now: new Date('2018-03-31T23:59:43Z') })).toBe(2);
  expect(getPastMonths({ ...state, now: new Date('2018-03-31T23:59:59.999Z') })).toBe(2);
  expect(getPastMonths({ ...state, now: new Date('2018-04-01T00:00:00.000Z') })).toBe(3);
  expect(getPastMonths({ ...state, now: new Date('2018-04-03T11:20Z') })).toBe(3);
});

test('getPastMonths is non-negative', () => {
  expect.assertions(3);
  expect(getPastMonths({ ...state, now: new Date('2018-01-20Z') })).toBe(0);
  expect(getPastMonths({ ...state, now: new Date('2017-10-18Z') })).toBe(0);
  expect(getPastMonths({ ...state, now: new Date('1943-04-10Z') })).toBe(0);
});

test('getFutureMonths gets the future months number', () => {
  expect.assertions(3);
  expect(getFutureMonths(state)).toStrictEqual(state.overview.futureMonths);
  expect(getFutureMonths(stateAtMonthStart)).toBe(getFutureMonths(state));
  expect(getFutureMonths(stateAtMonthEnd)).toBe(getFutureMonths(state));
});

test("getFutureMonths doesn't change when the state time updates", () => {
  expect.assertions(4);
  expect(getFutureMonths({ ...state, now: new Date('2018-03-31T23:59:43Z') })).toBe(
    state.overview.futureMonths,
  );
  expect(getFutureMonths({ ...state, now: new Date('2018-03-31T23:59:59.999Z') })).toBe(
    state.overview.futureMonths,
  );
  expect(getFutureMonths({ ...state, now: new Date('2018-04-01T00:00:00.000Z') })).toBe(
    state.overview.futureMonths,
  );
  expect(getFutureMonths({ ...state, now: new Date('2018-04-03T11:20Z') })).toBe(
    state.overview.futureMonths,
  );
});

test('getEndDate gets the end date', () => {
  expect.assertions(3);
  expect(getEndDate(state)).toStrictEqual(new Date('2018-06-30T23:59:59.999Z'));
  expect(getEndDate(stateAtMonthStart)).toStrictEqual(getEndDate(state));
  expect(getEndDate(stateAtMonthEnd)).toStrictEqual(getEndDate(state));
});

test('getEndDate limits at viewStartDate', () => {
  expect.assertions(4);
  expect(getEndDate({ ...state, now: new Date('2018-01-10Z') })).toStrictEqual(
    new Date('2018-04-30T23:59:59.999Z'),
  );
  expect(getEndDate({ ...state, now: new Date('2017-12-19Z') })).toStrictEqual(
    new Date('2018-03-31T23:59:59.999Z'),
  );
  expect(getEndDate({ ...state, now: new Date('2017-11-11Z') })).toStrictEqual(
    new Date('2018-02-28T23:59:59.999Z'),
  );
  expect(getEndDate({ ...state, now: new Date('1965-07-13Z') })).toStrictEqual(
    new Date('2018-01-31T23:59:59.999Z'),
  );
});

test('getNumMonths gets the number of months in overview views, given the start and end date', () => {
  expect.assertions(3);
  expect(getNumMonths(state)).toBe(6); // jan-18 to jun-18 inclusive
  expect(getNumMonths(stateAtMonthStart)).toBe(getNumMonths(state));
  expect(getNumMonths(stateAtMonthEnd)).toBe(getNumMonths(state));
});

test('getNumMonths increases when the time increases', () => {
  expect.assertions(1);
  expect(getNumMonths({ ...state, now: new Date('2018-08-10Z') })).toBe(11); // jan-18 to nov-18 inclusive
});

test('getNumMonths is strictly positive', () => {
  expect.assertions(1);
  expect(getNumMonths({ ...state, now: new Date('2017-01-03') })).toBe(1);
});

test('getMonthDates gets a list of dates at the end of each month', () => {
  expect.assertions(3);
  expect(getMonthDates(state)).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
    new Date('2018-02-28T23:59:59.999Z'),
    new Date('2018-03-31T23:59:59.999Z'),
    new Date('2018-04-30T23:59:59.999Z'),
    new Date('2018-05-31T23:59:59.999Z'),
    new Date('2018-06-30T23:59:59.999Z'),
  ]);
  expect(getMonthDates(stateAtMonthStart)).toStrictEqual(getMonthDates(state));
  expect(getMonthDates(stateAtMonthEnd)).toStrictEqual(getMonthDates(state));
});

test('getMonthDates handles the case when the client time is out of sync', () => {
  expect.assertions(4);
  expect(getMonthDates({ ...state, now: new Date('2018-08-10Z') })).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
    new Date('2018-02-28T23:59:59.999Z'),
    new Date('2018-03-31T23:59:59.999Z'),
    new Date('2018-04-30T23:59:59.999Z'),
    new Date('2018-05-31T23:59:59.999Z'),
    new Date('2018-06-30T23:59:59.999Z'),
    new Date('2018-07-31T23:59:59.999Z'),
    new Date('2018-08-31T23:59:59.999Z'),
    new Date('2018-09-30T23:59:59.999Z'),
    new Date('2018-10-31T23:59:59.999Z'),
    new Date('2018-11-30T23:59:59.999Z'),
  ]);

  expect(getMonthDates({ ...state, now: new Date('2017-01-03Z') })).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
  ]);

  expect(getMonthDates({ ...state, now: new Date('2017-11-07') })).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
    new Date('2018-02-28T23:59:59.999Z'),
  ]);

  expect(getMonthDates({ ...state, now: new Date('2017-12-30Z') })).toStrictEqual([
    new Date('2018-01-31T23:59:59.999Z'),
    new Date('2018-02-28T23:59:59.999Z'),
    new Date('2018-03-31T23:59:59.999Z'),
  ]);
});
