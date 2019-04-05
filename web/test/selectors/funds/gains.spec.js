import test from 'ava';
import { Map as map } from 'immutable';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';
import {
    getRowGains
} from '~client/selectors/funds/gains';

test('getRowGains returns the correct values', t => {
    const testCache = map({
        startTime: testStartTime,
        cacheTimes: testCacheTimes,
        prices: testPrices
    });

    const gains = getRowGains(testRows, testCache);

    const expectedResult = map([
        [10, map({
            value: 399098.2,
            gain: -0.0023,
            gainAbs: -902,
            dayGain: 0.0075,
            dayGainAbs: 2989
        })],
        [3, map({
            value: 50300,
            gain: 0.1178,
            gainAbs: 5300
        })],
        [1, map({
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240
        })],
        [5, map({
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622
        })]
    ]);

    t.deepEqual(gains.toJS(), expectedResult.toJS());
});

