import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';

import {
    getNetWorthSummary,
    getNetWorthSummaryOld
} from '~client/selectors/net-worth';

import { getNumMonths } from '~client/selectors/common';

test('getNetWorthSummary gets a list of net worth values by month', t => {
    const result = getNetWorthSummary(state);

    t.true(Array.isArray(result));
    t.is(result.length, getNumMonths(state));

    t.is(result[0], 0); // January 2018 doesn't have any entries
    t.is(result[1], 10324 + 0.035 * 3750 + 1296523 - 8751);
    t.is(result[2], 9752 + 1051343 - 21939);
    t.is(result[3], 0); // April 2018 doesn't have any entries
    t.is(result[4], 0); // May 2018 "
    t.is(result[5], 0); // June 2018 "
    t.is(result[6], 0); // July 2018 "
});

test('getNetWorthSummaryOld gets old entry values, if there are any', t => {
    const result = getNetWorthSummaryOld({
        ...state,
        overview: {
            startDate: DateTime.fromISO('2018-03-31'),
            endDate: DateTime.fromISO('2018-05-31')
        },
        netWorth: {
            ...state.netWorth,
            entries: [
                {
                    date: DateTime.fromISO('2018-01-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 13502 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-02-28'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 19220 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-03-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 11876 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-04-30'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 14981 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-05-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 14230 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-06-30'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 12678 }
                    ],
                    creditLimit: [],
                    currencies: []
                },
                {
                    date: DateTime.fromISO('2018-07-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 0 }
                    ],
                    creditLimit: [],
                    currencies: []
                }
            ]
        }
    });

    t.deepEqual(result, [13502, 19220]);
});
