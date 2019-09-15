import test from 'ava';
import { DateTime } from 'luxon';

import {
    getValuesWithTime,
} from '~client/components/GraphCashFlow';

test('getValuesWithTime returns an array of coordinates', (t) => {
    const data = [1, 2, 3];

    const props = {
        now: DateTime.fromISO('2019-06-26T21:48:03.000Z'),
        oldOffset: 0,
        breakAtToday: false,
        startDate: DateTime.fromISO('2018-01-03T00:00:00.000Z'),
    };

    const result = getValuesWithTime(data, props);

    t.true(Array.isArray(result));
    t.true(result.every((point) => Array.isArray(point)));
    t.true(result.every((point) => point.length === 2));
    t.true(result.every((point) => point.every((value) => typeof value === 'number')));
});
