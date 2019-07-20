import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';

import {
    getNetWorthSummary,
    getNetWorthSummaryOld,
    getAggregates,
    getNetWorthTable
} from '~client/selectors/overview/net-worth';

import { getNumMonths } from '~client/selectors/overview/common';
import { replaceAtIndex } from '~client/modules/data';
import { DELETE } from '~client/constants/data';

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

test('getNetWorthSummary excludes optimistically deleted entries', t => {
    const result = getNetWorthSummary({
        ...state,
        netWorth: {
            ...state.netWorth,
            entries: replaceAtIndex(state.netWorth.entries, 1,
                entry => ({ ...entry, __optimistic: DELETE }), true)
        }
    });

    t.true(Array.isArray(result));
    t.is(result.length, getNumMonths(state));

    t.is(result[0], 0); // January 2018 doesn't have any entries
    t.is(result[1], 10324 + 0.035 * 3750 + 1296523 - 8751);
    t.is(result[2], 0);
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

test('getNetWorthTable returns a list of rows for the view', t => {
    t.deepEqual(getNetWorthTable(state), [
        {
            id: 'real-entry-id-a',
            date: DateTime.fromISO('2018-02-28'),
            assets: 10324 + 3750 * 0.035 + 1296523,
            liabilities: 8751,
            expenses: 900 + 13 + 90 + 1000 + 65,
            fti: ((10324 + 3750 * 0.035 + 1296523) - (8751)) *
            (28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12)
        },
        {
            id: 'real-entry-id-b',
            date: DateTime.fromISO('2018-03-31'),
            assets: 9752 + 1051343,
            liabilities: 21939,
            expenses: 400 + 20 + 10 + 95 + 134,
            fti: ((9752 + 1051343) - (21939)) * (28 + (58 + 31) / 365) / (
                ((900 + 13 + 90 + 1000 + 65) + (400 + 20 + 10 + 95 + 134)) *
                    12 / 2
            )
        }
    ]);
});

test('getAggregates returns the latest summed value of a group of categories', t => {
    t.deepEqual(getAggregates(state, {
        cash: 'Cash (easy access)',
        mortgage: 'Mortgage',
        cc: 'Credit cards',
        no: 'nonexistent category'
    }), {
        cash: 9752 + 1051343,
        mortgage: -18420900,
        cc: -21939,
        no: 0
    });
});
