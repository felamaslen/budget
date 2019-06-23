import test from 'ava';
import { Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    getInitialEnabledList,
    processPrices,
    processPageDataFunds
} from '~client/reducers/funds.reducer';

test('getInitialEnabledList enabling funds if and only if they have a price at the most recent cache point', t => {
    const prices = map([
        [1, map({ values: list([3.23, 3.10, 3.92]), startIndex: 0 })],
        [2, map({ values: list([1.2, 1.02, 1.38]), startIndex: 10 })],
        [3, map({ values: list([0, 0, 0, 10, 11, 12, 11.5, 10.3, 9, 9.8, 9.91, 9.2, 11.03]), startIndex: 0 })]
    ]);

    t.deepEqual(getInitialEnabledList(prices).toJS(), {
        '1': false,
        '2': true,
        '3': true,
        overall: true
    });
});

test('processPrices maping the raw API response to price lists', t => {
    const rowsRaw = [
        {
            'I': 3,
            pr: [10, 9, 10, 11, 9, 8, 9],
            prStartIndex: 3
        },
        {
            'I': 2,
            pr: [3, 4, 3.4],
            prStartIndex: 0
        }
    ];

    const expectedResult = map([
        [3, map({ values: list.of(10, 9, 10, 11, 9, 8, 9), startIndex: 3 })],
        [2, map({ values: list.of(3, 4, 3.4), startIndex: 0 })]
    ]);

    t.deepEqual(processPrices(rowsRaw), expectedResult);
});

const envBefore = process.env.DEFAULT_FUND_PERIOD;
test.before(() => {
    process.env.DEFAULT_FUND_PERIOD = 'year1';
});
test.after(() => {
    process.env.DEFAULT_FUND_PERIOD = envBefore;
});

test('processPageDataFunds returning formatted funds page data', t => {
    const reduction = map({
        now: DateTime.fromISO('2017-09-05T00:00Z'),
        pages: map.of(),
        other: map({
            graphFunds: map({
                period: 'year1',
                zoom: list([null, null])
            })
        })
    });

    const now = new Date('2017-09-05');
    const startTime = Math.floor(new Date('2017-09-01').getTime() / 1000);

    const raw = {
        data: [
            {
                'd': [2016, 9, 1],
                'i': 'some fund name',
                'c': 100000,
                'I': 1,
                tr: [
                    { 'c': 700000, 'u': 100, 'd': [2016, 9, 1] },
                    { 'c': 300000, 'u': 40, 'd': [2017, 1, 5] }
                ],
                pr: [
                    100.5,
                    102.3,
                    101.9,
                    99.76,
                    98.1,
                    99.12
                ],
                prStartIndex: 2
            }
        ],
        total: 100000,
        startTime,
        cacheTimes: [0, 1, 2, 3, 4, 5, 6, 7]
    };

    const result = processPageDataFunds(reduction, { raw }, now);

    t.deepEqual(
        result.getIn(['pages', 'funds', 'cache', 'year1']).toJS(),
        {
            startTime: 1504224000,
            cacheTimes: [0, 1, 2, 3, 4, 5, 6, 7],
            prices: {
                '1': {
                    startIndex: 2,
                    values: [100.5, 102.3, 101.9, 99.76, 98.1, 99.12]
                }
            }
        }
    );

    t.deepEqual(
        result.getIn(['other', 'graphFunds', 'zoomRange']).toJS(),
        [0, 86400 * 4]
    );
});
