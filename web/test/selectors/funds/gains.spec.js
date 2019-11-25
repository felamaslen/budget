import test from 'ava';
import { DateTime } from 'luxon';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';
import {
    getRowGains,
    getGainsForRow,
    getDayGain,
    getDayGainAbs,
} from '~client/selectors/funds/gains';
import { getTransactionsList } from '~client/modules/data';

const testCache = {
    startTime: testStartTime,
    cacheTimes: testCacheTimes,
    prices: testPrices,
};

const stateWithGains = {
    funds: {
        items: [
            {
                id: 'fund1',
                transactions: getTransactionsList([
                    { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
                ]),
            },
            {
                id: 'fund2',
                transactions: getTransactionsList([
                    { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
                    { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
                ]),
            },
        ],
        period: 'somePeriod',
        cache: {
            somePeriod: {
                startTime: DateTime.fromISO('2019-10-10').ts / 1000,
                cacheTimes: [0, 86400 * 5, 86400 * 32],
                prices: {
                    fund1: {
                        startIndex: 1,
                        values: [109, 113.2],
                    },
                    fund2: {
                        startIndex: 0,
                        values: [56.2, 57.9, 49.3],
                    },
                },
            },
        },
    },
};

test('getRowGains returns the correct values', t => {
    const result = getRowGains(testRows, testCache);

    const expectedResult = {
        10: {
            value: 399098.2,
            gain: -0.0023,
            gainAbs: -902,
            dayGain: 0.0075,
            dayGainAbs: 2989,
        },
        3: {
            value: 50300,
            gain: 0.1178,
            gainAbs: 5300,
        },
        1: {
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240,
        },
        5: {
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622,
        },
    };

    t.deepEqual(result, expectedResult);
});

test('getRowGains sets the value to 0 for funds with no data', t => {
    const result = getRowGains([{ id: 'non-existent-id', item: 'some fund' }], testCache);

    t.deepEqual(result, {
        'non-existent-id': {
            value: 0,
            gain: 0,
            gainAbs: 0,
        },
    });
});

test('getRowGains sets the cost and estimated value, if there are transactions available', t => {
    const result = getRowGains(
        [
            {
                id: 'non-existent-id',
                item: 'some fund',
                transactions: getTransactionsList([
                    { date: '2019-04-03', units: 345, cost: 1199 },
                    { date: '2019-07-01', units: -345, cost: -1302 },
                ]),
            },
        ],
        testCache,
    );

    t.deepEqual(result, {
        'non-existent-id': {
            value: 1302,
            gainAbs: 1302 - 1199,
            gain: Number(((1302 - 1199) / 1199).toFixed(5)),
        },
    });
});

test('getGainsForRow sets a colour', t => {
    const rowGains = {
        10: {
            value: 399098.2,
            gain: -0.0023,
            gainAbs: -902,
            dayGain: 0.0075,
            dayGainAbs: 2989,
        },
        3: {
            value: 50300,
            gain: 0.1178,
            gainAbs: 5300,
        },
        1: {
            id: '1',
            value: 80760,
            gain: -0.1027,
            gainAbs: -9240,
        },
        5: {
            id: '5',
            value: 265622,
            gain: 0.3281,
            gainAbs: 65622,
        },
    };

    t.deepEqual(getGainsForRow(rowGains, '10'), { ...rowGains['10'], color: [255, 250, 250] });
    t.deepEqual(getGainsForRow(rowGains, '3'), { ...rowGains['3'], color: [163, 246, 170] });
    t.deepEqual(getGainsForRow(rowGains, '1'), { ...rowGains['1'], color: [255, 44, 44] });
    t.deepEqual(getGainsForRow(rowGains, '5'), { ...rowGains['5'], color: [0, 230, 18] });

    t.falsy(getGainsForRow(rowGains, 'non-existent-id'));
});

test('getGainsForRow returns null if there are no gain data for the fund', t => {
    const rowGains = {
        'some-id': {},
    };

    t.is(getGainsForRow(rowGains, 'some-id'), null);
});

test('getDayGainAbs returns the absolute gain from the previous scrape', t => {
    const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;
    const valuePrev = 345 * 109 + 167 * 57.9;

    t.is(getDayGainAbs(stateWithGains), valueLatest - valuePrev);
});

test('getDayGain returns the gain from the previous scrape', t => {
    const costLatest = 1199 + (98503 - 130);
    const valueLatest = 345 * 113.2 + (167 - 23) * 49.3;

    // on the second cache item, the 2019-10-27 transaction is in the future
    const costPrev = 1199 + 98503;
    const valuePrev = 345 * 109 + 167 * 57.9;

    const gainLatest = (valueLatest - costLatest) / costLatest;
    const gainPrev = (valuePrev - costPrev) / costPrev;

    const expectedDayGain = (1 + gainLatest) / (1 + gainPrev) - 1;

    t.is(getDayGain(stateWithGains), expectedDayGain);
});

test('getDayGain returns 0 when there are no items', t => {
    t.is(
        getDayGain({
            funds: {
                items: [],
                period: 'somePeriod',
                cache: {
                    somePeriod: {
                        startTime: DateTime.fromISO('2019-10-10').ts / 1000,
                        cacheTimes: [0, 86400 * 5, 86400 * 32],
                        prices: {
                            fund1: {
                                startIndex: 1,
                                values: [109, 113.2],
                            },
                            fund2: {
                                startIndex: 0,
                                values: [56.2, 57.9, 49.3],
                            },
                        },
                    },
                },
            },
        }),
        0,
    );
});

test('getDayGain returns 0 when there is no cache', t => {
    t.is(
        getDayGain({
            funds: {
                items: [
                    {
                        id: 'fund1',
                        transactions: getTransactionsList([
                            { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
                        ]),
                    },
                    {
                        id: 'fund2',
                        transactions: getTransactionsList([
                            { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
                            { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
                        ]),
                    },
                ],
                period: 'somePeriod',
                cache: {},
            },
        }),
        0,
    );
});

test('getDayGain returns 0 when the cache contains only one item', t => {
    t.is(
        getDayGain({
            funds: {
                items: [
                    {
                        id: 'fund1',
                        transactions: getTransactionsList([
                            { date: DateTime.fromISO('2019-10-09'), units: 345, cost: 1199 },
                        ]),
                    },
                    {
                        id: 'fund2',
                        transactions: getTransactionsList([
                            { date: DateTime.fromISO('2019-10-01'), units: 167, cost: 98503 },
                            { date: DateTime.fromISO('2019-10-27'), units: -23, cost: -130 },
                        ]),
                    },
                ],
                period: 'somePeriod',
                cache: {
                    somePeriod: {
                        startTime: DateTime.fromISO('2019-10-10').ts / 1000,
                        cacheTimes: [10],
                        prices: {
                            fund1: {
                                startIndex: 1,
                                values: [109, 113.2],
                            },
                            fund2: {
                                startIndex: 0,
                                values: [56.2, 57.9, 49.3],
                            },
                        },
                    },
                },
            },
        }),
        0,
    );
});
