import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';

import {
    getStartDate,
    getEndDate,
    getNumMonths,
    getFutureMonths,
    getMonthDates
} from '~client/selectors/overview/common';

test('getStartDate gets the start date', t => {
    t.deepEqual(getStartDate(state), DateTime.fromISO('2018-01-31T23:59:59.999Z'));
});

test('getEndDate gets the end date', t => {
    t.deepEqual(getEndDate(state), DateTime.fromISO('2018-07-31T23:59:59.999Z'));
});

test('getNumMonths gets the number of months in overview views, given the start and end date', t => {
    t.is(getNumMonths(state), 7);
});

test('getFutureMonths calculates the number of months in the future there are, based on the current date', t => {
    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-23T11:45:20Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-31T15:20Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-31T22:59Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-04-01T00:00Z') }), 2);
});

test('getMonthDates gets a list of dates at the end of each month', t => {
    t.deepEqual(getMonthDates(state), [
        DateTime.fromISO('2018-01-31T23:59:59.999Z'),
        DateTime.fromISO('2018-02-28T23:59:59.999Z'),
        DateTime.fromISO('2018-03-31T23:59:59.999Z'),
        DateTime.fromISO('2018-04-30T23:59:59.999Z'),
        DateTime.fromISO('2018-05-31T23:59:59.999Z'),
        DateTime.fromISO('2018-06-30T23:59:59.999Z'),
        DateTime.fromISO('2018-07-31T23:59:59.999Z')
    ]);
});
