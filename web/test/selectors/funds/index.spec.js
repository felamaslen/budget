import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';
import {
    getFundsCachedValueAgeText,
    getFundsCachedValue,
    getFundsCost,
    getProcessedFundsRows
} from '~client/selectors/funds';

test('getFundsCachedValueAgeText returns the expected string', t => {
    const now = DateTime.fromISO('2018-06-03');

    t.is(getFundsCachedValueAgeText(now.ts / 1000 - 4000, [0, 100, 400], now), '1 hour ago');
});

test('getFundsCachedValue gets an age text and value', t => {
    const expectedValue = 399098.2;
    const expectedAgeText = '6 months, 3 weeks ago';

    t.deepEqual(getFundsCachedValue(state), { value: expectedValue, ageText: expectedAgeText });
});

test('getFundsCost gets the total fund cost, excluding sold funds', t => {
    t.is(getFundsCost(state), 400000);
});

test('getProcessedFundsRows sets gain, prices, sold and class information on each fund row', t => {
    const result = getProcessedFundsRows(state);

    t.true(Array.isArray(result));
    t.is(result.length, 4);

    const { cols: cols10, prices: prices10, ...rest10 } = result.find(({ id }) => id === '10');

    t.deepEqual(rest10, {
        id: '10',
        className: '',
        sold: false,
        gain: {
            color: [255, 250, 250],
            dayGain: 0.0075,
            dayGainAbs: 2989,
            gain: -0.0023,
            gainAbs: -902,
            value: 399098.2
        }
    });

    const { cols: cols1, prices: prices1, ...rest1 } = result.find(({ id }) => id === '1');

    t.deepEqual(rest1, {
        id: '1',
        className: 'sold',
        sold: true,
        gain: {
            color: [255, 44, 44],
            gain: -0.1027,
            gainAbs: -9240,
            value: 80760
        }
    });
});
