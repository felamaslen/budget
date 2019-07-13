import test from 'ava';
import { DateTime } from 'luxon';

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
