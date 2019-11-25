import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';
import {
    getTargets,
} from '~client/selectors/graph';

test('getTargets gets a list of savings targets', (t) => {
    const result = getTargets({
        ...state,
        netWorth: {
            ...state.netWorth,
            entries: [
                {
                    date: DateTime.fromISO('2018-01-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 13502 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-02-28'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 19220 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-03-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 11876 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-04-30'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 14981 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-05-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 14230 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-06-30'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 12678 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
                {
                    date: DateTime.fromISO('2018-07-31'),
                    values: [
                        { subcategory: 'real-wallet-subcategory-id', value: 0 },
                    ],
                    creditLimit: [],
                    currencies: [],
                },
            ],
        },
    });

    t.deepEqual(result, [
        {
            date: DateTime.fromISO('2018-01-31').endOf('day').ts / 1000,
            from: 13502,
            months: 12,
            last: 3,
            tag: '1y',
            value: 73434.5,
        },
        {
            date: DateTime.fromISO('2018-05-31').endOf('day').ts / 1000,
            from: 14230,
            months: 36,
            last: 6,
            tag: '3y',
            value: 75239.20000000001,
        },
        {
            date: DateTime.fromISO('2018-06-30').endOf('day').ts / 1000,
            from: 12678,
            months: 60,
            last: 12,
            tag: '5y',
            value: 70376 + 2 / 11,
        },
    ]);
});
