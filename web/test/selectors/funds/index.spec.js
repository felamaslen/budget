import test from 'ava';
import { fromJS, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    getFundsCachedValueAgeText,
    getFundsCachedValue,
    getProcessedFundsRows
} from '~client/selectors/funds';
import { testRows, testPrices, testStartTime, testCacheTimes } from '../../test_data/testFunds';

test('getFundsCachedValueAgeText returns the expected string', t => {
    const now = DateTime.fromISO('2018-06-03');

    t.is(getFundsCachedValueAgeText(now.ts / 1000 - 4000, list([0, 100, 400]), now), '1 hour ago');
});

test('getFundsCachedValue gets an age text and value', t => {
    const state = fromJS({
        now: DateTime.fromISO('2017-09-01T19:01Z'),
        pages: {
            funds: {
                rows: testRows,
                cache: {
                    period1: {
                        startTime: testStartTime,
                        cacheTimes: testCacheTimes,
                        prices: testPrices
                    }
                }
            }
        },
        other: {
            graphFunds: {
                period: 'period1'
            }
        }
    });

    const expectedValue = 399098.2;
    const expectedAgeText = '2 hours ago';

    t.deepEqual(getFundsCachedValue(state).toJS(), { value: expectedValue, ageText: expectedAgeText });
});

test('getProcessedFundsRows sets gain, prices, sold and class information on each fund row', t => {
    const state = fromJS({
        now: DateTime.fromISO('2017-09-01T19:01Z'),
        pages: {
            funds: {
                rows: testRows,
                cache: {
                    period1: {
                        startTime: testStartTime,
                        cacheTimes: testCacheTimes,
                        prices: testPrices
                    }
                }
            }
        },
        other: {
            graphFunds: {
                period: 'period1'
            }
        }
    });

    const result = getProcessedFundsRows(state);

    t.deepEqual(
        result
            .get(10)
            .remove('cols')
            .remove('prices')
            .toJS(),
        {
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
        }
    );

    t.deepEqual(
        result
            .get(1)
            .remove('cols')
            .remove('prices')
            .toJS(),
        {
            className: 'sold',
            sold: true,
            gain: {
                color: [255, 44, 44],
                gain: -0.1027,
                gainAbs: -9240,
                value: 80760
            }
        }
    );
});

