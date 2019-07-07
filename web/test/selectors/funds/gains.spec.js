import test from 'ava';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';
import {
    getRowGains,
    getGainsForRow
} from '~client/selectors/funds/gains';

const testCache = {
    startTime: testStartTime,
    cacheTimes: testCacheTimes,
    prices: testPrices
};

test('getRowGains returns the correct values', t => {
    const result = getRowGains(testRows, testCache);

    const expectedResult = {
        '10': {
            value: 399098.2,
            gain: -0.0023,
            gainAbs: -902,
            dayGain: 0.0075,
            dayGainAbs: 2989
        },
        '3': {
            value: 50300,
            gain: 0.1178,
            gainAbs: 5300
        },
        '1': {
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240
        },
        '5': {
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622
        }
    };

    t.deepEqual(result, expectedResult);
});

test('getRowGains sets empty objects for funds with no data', t => {
    const result = getRowGains([
        { id: 'non-existent-id', item: 'some fund' }
    ], testCache);

    t.deepEqual(result, {
        'non-existent-id': {}
    });
});

test('getGainsForRow sets a colour', t => {
    const rowGains = {
        '10': {
            value: 399098.2,
            gain: -0.0023,
            gainAbs: -902,
            dayGain: 0.0075,
            dayGainAbs: 2989
        },
        '3': {
            value: 50300,
            gain: 0.1178,
            gainAbs: 5300
        },
        '1': {
            id: '1',
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240
        },
        '5': {
            id: '5',
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622
        }
    };

    t.deepEqual(getGainsForRow(rowGains, '10'), { ...rowGains['10'], color: [255, 250, 250] });
    t.deepEqual(getGainsForRow(rowGains, '3'), { ...rowGains['3'], color: [163, 246, 170] });
    t.deepEqual(getGainsForRow(rowGains, '1'), { ...rowGains['1'], color: [255, 44, 44] });
    t.deepEqual(getGainsForRow(rowGains, '5'), { ...rowGains['5'], color: [0, 230, 18] });

    t.falsy(getGainsForRow(rowGains, 'non-existent-id'));
});
