import test from 'ava';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';

import {
    getCategories,
    getSubcategories,
    getNetWorthSummary,
    getNetWorthSummaryOld,
    getAggregates,
    getNetWorthTable,
    getNetWorthRequests,
} from '~client/selectors/overview/net-worth';

import { getNumMonths } from '~client/selectors/overview/common';
import { replaceAtIndex } from '~client/modules/data';
import { CREATE, UPDATE, DELETE } from '~client/constants/data';

test('getCategories excludes optimistically deleted items', (t) => {
    t.deepEqual(getCategories({
        netWorth: {
            categories: [
                { id: 'id-a', __optimistic: DELETE },
                { id: 'id-b' },
            ],
        },
    }), [{ id: 'id-b' }]);
});

test('getCategories sorts by type, then category', (t) => {
    t.deepEqual(getCategories({
        netWorth: {
            categories: [
                { id: 'id-a', type: 'asset', category: 'foo' },
                { id: 'id-b', type: 'liability', category: 'bar' },
                { id: 'id-c', type: 'asset', category: 'baz' },
                { id: 'id-d', type: 'asset', category: 'bak' },
            ],
        },
    }), [
        { id: 'id-d', type: 'asset', category: 'bak' },
        { id: 'id-c', type: 'asset', category: 'baz' },
        { id: 'id-a', type: 'asset', category: 'foo' },
        { id: 'id-b', type: 'liability', category: 'bar' },
    ]);
});

test('getSubcategories excludes optimistically deleted items', (t) => {
    t.deepEqual(getSubcategories({
        netWorth: {
            subcategories: [
                { id: 'id-a', __optimistic: DELETE },
                { id: 'id-b' },
            ],
        },
    }), [{ id: 'id-b' }]);
});

test('getSubcategories sorts by category ID and subcategory', (t) => {
    t.deepEqual(getSubcategories({
        netWorth: {
            subcategories: [
                { id: 'id-a', categoryId: 'cat-id-2', subcategory: 'foo' },
                { id: 'id-b', categoryId: 'cat-id-1', subcategory: 'bar' },
                { id: 'id-c', categoryId: 'cat-id-2', subcategory: 'baz' },
            ],
        },
    }), [
        { id: 'id-b', categoryId: 'cat-id-1', subcategory: 'bar' },
        { id: 'id-c', categoryId: 'cat-id-2', subcategory: 'baz' },
        { id: 'id-a', categoryId: 'cat-id-2', subcategory: 'foo' },
    ]);
});

test('getNetWorthSummary gets a list of net worth values by month', (t) => {
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

test('getNetWorthSummary excludes optimistically deleted entries', (t) => {
    const result = getNetWorthSummary({
        ...state,
        netWorth: {
            ...state.netWorth,
            entries: replaceAtIndex(state.netWorth.entries, 1,
                (entry) => ({ ...entry, __optimistic: DELETE }), true),
        },
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

test('getNetWorthSummaryOld gets the old net worth entry values, as provided by the API', (t) => {
    const result = getNetWorthSummaryOld({
        ...state,
        overview: {
            startDate: DateTime.fromISO('2018-03-31'),
            endDate: DateTime.fromISO('2018-05-31'),
        },
        netWorth: {
            ...state.netWorth,
            entries: [],
            old: [1000, 1302],
        },
    });

    t.deepEqual(result, [1000, 1302]);
});

test('getNetWorthTable returns a list of rows for the view', (t) => {
    t.deepEqual(getNetWorthTable(state), [
        {
            id: 'real-entry-id-a',
            date: DateTime.fromISO('2018-02-28'),
            assets: 10324 + 3750 * 0.035 + 1296523,
            liabilities: 8751,
            expenses: 900 + 13 + 90 + 1000 + 65,
            fti: ((10324 + 3750 * 0.035 + 1296523) - (8751)) * ((28 + 58 / 365) / ((900 + 13 + 90 + 1000 + 65) * 12)),
        },
        {
            id: 'real-entry-id-b',
            date: DateTime.fromISO('2018-03-31'),
            assets: 9752 + 1051343,
            liabilities: 21939,
            expenses: 400 + 20 + 10 + 95 + 134,
            fti: ((9752 + 1051343) - (21939)) * ((28 + (58 + 31) / 365) / (
                ((900 + 13 + 90 + 1000 + 65) + (400 + 20 + 10 + 95 + 134)) * (12 / 2))
            ),
        },
    ]);
});

test('getAggregates returns the latest summed value of a group of categories', (t) => {
    t.deepEqual(getAggregates(state, {
        cash: 'Cash (easy access)',
        mortgage: 'Mortgage',
        cc: 'Credit cards',
        no: 'nonexistent category',
    }), {
        cash: 9752 + 1051343,
        mortgage: -18420900,
        cc: -21939,
        no: 0,
    });
});

test('getNetWorthRequests gets requests for all items which don\'t reference fake IDs', (t) => {
    const stateOptimistic = {
        netWorth: {
            categories: [
                {
                    id: 'real-category-id',
                    __optimistic: DELETE,
                },
                {
                    id: 'fake-category-id',
                    foo: 'bar',
                    __optimistic: CREATE,
                },
            ],
            subcategories: [
                {
                    id: 'real-subcategory-id',
                    categoryId: 'real-category-id',
                    bar: 'baz',
                    __optimistic: UPDATE,
                },
                {
                    id: 'fake-subcategory-id-a',
                    categoryId: 'real-category-id',
                    __optimistic: CREATE,
                },
                {
                    id: 'fake-subcategory-id-b',
                    categoryId: 'fake-category-id',
                    __optimistic: CREATE,
                },
            ],
            entries: [
                {
                    id: 'real-entry-id',
                    date: DateTime.fromISO('2019-07-27'),
                    values: [
                        { subcategory: 'real-subcategory-id' },
                    ],
                    currencies: [],
                    creditLimit: [],
                    __optimistic: UPDATE,
                },
                {
                    id: 'fake-entry-id',
                    date: DateTime.fromISO('2019-07-04'),
                    values: [
                        { subcategory: 'real-subcategory-id' },
                        { subcategory: 'fake-subcategory-id-a' },
                    ],
                    currencies: [],
                    creditLimit: [],
                    __optimistic: CREATE,
                },
            ],
        },
    };

    const result = getNetWorthRequests(stateOptimistic);

    t.deepEqual(result, [
        {
            type: CREATE,
            fakeId: 'fake-category-id',
            method: 'post',
            route: 'data/net-worth/categories',
            body: {
                foo: 'bar',
            },
        },
        {
            type: DELETE,
            id: 'real-category-id',
            method: 'delete',
            route: 'data/net-worth/categories',
        },
        {
            type: CREATE,
            fakeId: 'fake-subcategory-id-a',
            method: 'post',
            route: 'data/net-worth/subcategories',
            body: {
                categoryId: 'real-category-id',
            },
        },
        {
            type: UPDATE,
            id: 'real-subcategory-id',
            method: 'put',
            route: 'data/net-worth/subcategories',
            body: {
                categoryId: 'real-category-id',
                bar: 'baz',
            },
        },
        {
            type: UPDATE,
            id: 'real-entry-id',
            method: 'put',
            route: 'data/net-worth',
            body: {
                date: '2019-07-27',
                values: [
                    { subcategory: 'real-subcategory-id' },
                ],
                currencies: [],
                creditLimit: [],
            },
        },
    ]);
});

test('getNetWorthRequests removes IDs from net worth entry dependents', (t) => {
    const stateWithEntryCreate = {
        netWorth: {
            categories: [{
                id: 'real-category-id',
            }],
            subcategories: [{
                id: 'real-subcategory-id',
                categoryId: 'real-category-id',
            }],
            entries: [{
                id: 'fake-entry-id',
                date: DateTime.fromISO('2019-07-31'),
                values: [
                    { id: 'fake-value-id', subcategory: 'real-subcategory-id' },
                ],
                creditLimit: [
                    { id: 'fake-credit-limit-id', subcategory: 'real-subcategory-id' },
                ],
                currencies: [
                    { id: 'fake-currency-id', currency: 'CZK', rate: 0.031 },
                ],
                __optimistic: CREATE,
            }],
        },
    };

    const result = getNetWorthRequests(stateWithEntryCreate);

    t.deepEqual(result, [{
        type: CREATE,
        fakeId: 'fake-entry-id',
        method: 'post',
        route: 'data/net-worth',
        body: {
            date: '2019-07-31',
            values: [
                { subcategory: 'real-subcategory-id' },
            ],
            creditLimit: [
                { subcategory: 'real-subcategory-id' },
            ],
            currencies: [
                { currency: 'CZK', rate: 0.031 },
            ],
        },
    }]);
});
