import test from 'ava';
import { DateTime } from 'luxon';

import {
    getAllPageRows,
    getSortedPageRows,
    getDailyTotals,
    getWeeklyAverages,
    getTotalCost,
    getCrudRequests
} from '~client/selectors/list';
import { testState as state } from '~client-test/test_data/state';
import { getTransactionsList } from '~client/modules/data';
import { CREATE, UPDATE, DELETE } from '~client/constants/data';

const stateWithUnorderedRows = {
    ...state,
    now: DateTime.fromISO('2018-04-13T12:45:23Z'),
    general: {
        ...state.general,
        items: [
            {
                id: 'id300',
                date: DateTime.fromISO('2018-02-03'),
                item: 'foo1',
                category: 'bar1',
                cost: 1139,
                shop: 'bak2'
            },
            {
                id: 'id29',
                date: DateTime.fromISO('2018-02-02'),
                item: 'foo3',
                category: 'bar3',
                cost: 498,
                shop: 'bak3'
            },
            {
                id: 'id81',
                date: DateTime.fromISO('2018-02-03'),
                item: 'foo2',
                category: 'bar2',
                cost: 876,
                shop: 'bak2'
            },
            {
                id: 'id956__SHOULD_NOT_SEE_THIS!',
                date: DateTime.fromISO('2018-03-09'),
                item: 'foo4',
                category: 'bar4',
                cost: 198,
                shop: 'bak4',
                __optimistic: DELETE
            },
            {
                id: 'id19',
                date: DateTime.fromISO('2018-04-17'),
                item: 'foo3',
                category: 'bar3',
                cost: 29,
                shop: 'bak3'
            }
        ]
    }
};

test('getAllPageRows excludes optimistically deleted items', t => {
    const result = getAllPageRows(stateWithUnorderedRows, { page: 'general' });

    t.true(Array.isArray(result));
    const ids = result.map(({ id }) => id);

    t.deepEqual(ids, ['id300', 'id29', 'id81', 'id19']);
});

test('getSortedPageRows sorts list rows by date, newest first, adding future / first present props', t => {
    const result = getSortedPageRows(stateWithUnorderedRows, { page: 'general' });

    t.deepEqual(result, [
        {
            id: 'id19',
            date: DateTime.fromISO('2018-04-17'),
            item: 'foo3',
            category: 'bar3',
            cost: 29,
            shop: 'bak3',
            future: true,
            firstPresent: false
        },
        {
            id: 'id300',
            date: DateTime.fromISO('2018-02-03'),
            item: 'foo1',
            category: 'bar1',
            cost: 1139,
            shop: 'bak2',
            future: false,
            firstPresent: true
        },
        {
            id: 'id81',
            date: DateTime.fromISO('2018-02-03'),
            item: 'foo2',
            category: 'bar2',
            cost: 876,
            shop: 'bak2',
            future: false,
            firstPresent: false
        },
        {
            id: 'id29',
            date: DateTime.fromISO('2018-02-02'),
            item: 'foo3',
            category: 'bar3',
            cost: 498,
            shop: 'bak3',
            future: false,
            firstPresent: false
        }
    ]);
});

test('getDailyTotals calculates daily totals for list pages', t => {
    const result = getDailyTotals(stateWithUnorderedRows, { page: 'general' });

    t.deepEqual(result, {
        id19: 29,
        id81: 1139 + 876,
        id29: 498
    });
});

test('getWeeklyAverages returns null for non-daily pages', t => {
    t.is(getWeeklyAverages(state, { page: 'analysis' }), null);
});

test('getWeeklyAverages returns the data with a processed weekly value', t => {
    t.is(getWeeklyAverages(state, { page: 'food' }), Math.round((29 + 1139 + 876 + 498) / 10.571428571428571));
});

test('getTotalCost returns the total cost of a list page', t => {
    t.is(getTotalCost(state, { page: 'food' }), 8755601);
});

test('getTotalCost returns the fund cost value for the funds page', t => {
    t.is(getTotalCost(state, { page: 'funds' }), 400000);
});

test('getCrudRequests maps optimistically updated items to a HTTP request list', t => {
    const stateWithUpdates = {
        income: { items: [] },
        funds: {
            items: [
                {
                    id: 'some-fund-id',
                    name: 'some-fund-name',
                    transactions: getTransactionsList([
                        { date: '2019-05-03', units: 103, cost: 99231 }
                    ]),
                    __optimistic: UPDATE
                }
            ]
        },
        bills: { items: [] },
        food: {
            items: [
                { id: 'real-id-z', other: 'this-prop', is: null, __optimistic: UPDATE }
            ]
        },
        general: {
            items: [
                { id: 'some-fake-id', some: 'prop', is: true, __optimistic: CREATE }
            ]
        },
        holiday: {
            items: [
                { id: 'real-id-x', thisProp: 'foo', is: false, __optimistic: DELETE }
            ]
        },
        social: { items: [] }
    };

    const requests = [
        {
            type: UPDATE,
            id: 'some-fund-id',
            method: 'put',
            route: 'funds',
            query: {},
            body: {
                id: 'some-fund-id',
                name: 'some-fund-name',
                transactions: [
                    { date: '2019-05-03', units: 103, cost: 99231 }
                ]
            }
        },
        {
            type: UPDATE,
            id: 'real-id-z',
            method: 'put',
            route: 'food',
            query: {},
            body: {
                id: 'real-id-z',
                other: 'this-prop',
                is: 'null'
            }
        },
        {
            type: CREATE,
            fakeId: 'some-fake-id',
            method: 'post',
            route: 'general',
            query: {},
            body: {
                some: 'prop',
                is: 'true'
            }
        },
        {
            type: DELETE,
            id: 'real-id-x',
            method: 'delete',
            route: 'holiday',
            query: {},
            body: {
                id: 'real-id-x'
            }
        }
    ];

    t.deepEqual(getCrudRequests(stateWithUpdates), requests);
});
