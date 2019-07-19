import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';

import {
    getNow,
    getCurrentDate
} from '~client/selectors/now';

test('getNow gets the current time from the state', t => {
    t.is(getNow({ now: 'foo' }), 'foo');
});

test('getCurrentDate gets the end of the current day', t => {
    t.deepEqual(getCurrentDate({
        now: DateTime.fromISO('2018-03-23T11:53:23Z')
    }), DateTime.fromISO('2018-03-23T23:59:59.999Z'));
});

test('getCurrentDate does not reload the result if the day doesn\'t change', t => {
    const result = getCurrentDate(state);

    const nextResult = getCurrentDate({ ...state, now: DateTime.fromISO('2018-03-23T12:32:02Z') });

    // notice this equality check is shallow, i.e. by reference, so if the date had
    // been recalculated, this test would fail :)
    t.is(nextResult, result);
});
