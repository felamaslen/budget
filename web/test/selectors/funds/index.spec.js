import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';
import {
    getFundsCachedValueAgeText,
    getFundsCachedValue,
    getFundsCost,
    getProcessedFundsRows,
} from '~client/selectors/funds';
import { getDayGain, getDayGainAbs } from '~client/selectors/funds/gains';
import { getTransactionsList } from '~client/modules/data';

test('getFundsCachedValueAgeText returns the expected string', t => {
    const now = DateTime.fromISO('2018-06-03');

    t.is(getFundsCachedValueAgeText(now.ts / 1000 - 4000, [0, 100, 400], now), '1 hour ago');
});

test('getFundsCachedValueAgeText uses only one unit', t => {
    const now = DateTime.fromISO('2018-06-03');

    t.is(
        getFundsCachedValueAgeText(now.ts / 1000 - 86400 - 3600 * 5.4, [0, 100, 400], now),
        '1 day ago',
    );
});

test('getFundsCachedValue gets an age text and value', t => {
    const expectedValue = 399098.2;
    const expectedAgeText = '7 months ago';

    t.deepEqual(getFundsCachedValue(state), {
        value: expectedValue,
        ageText: expectedAgeText,
        dayGain: getDayGain(state),
        dayGainAbs: getDayGainAbs(state),
    });
});

test('getFundsCachedValue returns a default value if there are no data', t => {
    const stateNoCache = {
        ...state,
        funds: {
            ...state.funds,
            cache: null,
        },
    };

    t.deepEqual(getFundsCachedValue(stateNoCache), {
        dayGain: getDayGain(stateNoCache),
        dayGainAbs: getDayGainAbs(stateNoCache),
        value: 0,
        ageText: '',
    });
});

test('getFundsCachedValue skips funds without price data', t => {
    const stateNoPrice = {
        ...state,
        funds: {
            ...state.funds,
            items: [
                ...state.funds.items,
                {
                    item: 'new fund',
                    transactions: getTransactionsList([
                        { date: '2019-07-23', units: 13, cost: 12 },
                    ]),
                },
            ],
        },
    };

    t.deepEqual(getFundsCachedValue(stateNoPrice), {
        dayGain: getDayGain(stateNoPrice),
        dayGainAbs: getDayGainAbs(stateNoPrice),
        value: 399098.2,
        ageText: '7 months ago',
    });
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
        item: 'some fund 1',
        transactions: state.funds.items[0].transactions,
        small: false,
        sold: false,
        gain: {
            color: [255, 250, 250],
            dayGain: 0.0075,
            dayGainAbs: 2989,
            gain: -0.0023,
            gainAbs: -902,
            value: 399098.2,
        },
    });

    const { cols: cols1, prices: prices1, ...rest1 } = result.find(({ id }) => id === '1');

    t.deepEqual(rest1, {
        id: '1',
        item: 'some fund 3',
        transactions: state.funds.items[2].transactions,
        small: true,
        sold: true,
        gain: {
            color: [255, 44, 44],
            gain: -0.1027,
            gainAbs: -9240,
            value: 80760,
        },
    });
});
