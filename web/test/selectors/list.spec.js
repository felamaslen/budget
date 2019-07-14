import test from 'ava';
import { DateTime } from 'luxon';

import {
    getAllPageRows,
    getSortedPageRows,
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

test('getSortedPageRows sorts list rows by date, newest first, adding future / first present / daily props', t => {
    const craftedState = {
        now: DateTime.fromISO('2019-07-13T15:23:39Z'),
        general: {
            items: [
                { id: 'id2', date: DateTime.fromISO('2019-06-16'), cost: 2 },
                { id: 'id3', date: DateTime.fromISO('2019-06-16'), cost: 3 },
                { id: 'id5', date: DateTime.fromISO('2019-06-16'), cost: 5 },
                { id: 'id7', date: DateTime.fromISO('2019-06-15'), cost: 7 },
                { id: 'id11', date: DateTime.fromISO('2019-06-16'), cost: 11 },
                { id: 'id13', date: DateTime.fromISO('2019-06-16'), cost: 13 },
                { id: 'id17', date: DateTime.fromISO('2019-06-15'), cost: 17 },
                { id: 'id19', date: DateTime.fromISO('2019-06-14'), cost: 19 },
                { id: 'id29', date: DateTime.fromISO('2019-06-13'), cost: 29 },
                { id: 'id23', date: DateTime.fromISO('2019-06-14'), cost: 23 },
                { id: 'id31', date: DateTime.fromISO('2019-07-25'), cost: 31 },
                { id: 'id37', date: DateTime.fromISO('2019-08-21'), cost: 37 }
            ]
        }
    };

    const result = getSortedPageRows(craftedState, { page: 'general' });

    t.deepEqual(result, [
        { id: 'id37', date: DateTime.fromISO('2019-08-21'), cost: 37, future: true, firstPresent: false, daily: 37 },
        { id: 'id31', date: DateTime.fromISO('2019-07-25'), cost: 31, future: true, firstPresent: false, daily: 31 },
        { id: 'id5', date: DateTime.fromISO('2019-06-16'), cost: 5, future: false, firstPresent: true, daily: null },
        { id: 'id2', date: DateTime.fromISO('2019-06-16'), cost: 2, future: false, firstPresent: false, daily: null },
        { id: 'id11', date: DateTime.fromISO('2019-06-16'), cost: 11, future: false, firstPresent: false, daily: null },
        { id: 'id13', date: DateTime.fromISO('2019-06-16'), cost: 13, future: false, firstPresent: false, daily: null },
        { id: 'id3', date: DateTime.fromISO('2019-06-16'), cost: 3, future: false, firstPresent: false, daily: 34 },
        { id: 'id7', date: DateTime.fromISO('2019-06-15'), cost: 7, future: false, firstPresent: false, daily: null },
        { id: 'id17', date: DateTime.fromISO('2019-06-15'), cost: 17, future: false, firstPresent: false, daily: 24 },
        { id: 'id19', date: DateTime.fromISO('2019-06-14'), cost: 19, future: false, firstPresent: false, daily: null },
        { id: 'id23', date: DateTime.fromISO('2019-06-14'), cost: 23, future: false, firstPresent: false, daily: 42 },
        { id: 'id29', date: DateTime.fromISO('2019-06-13'), cost: 29, future: false, firstPresent: false, daily: 29 }
    ]);
});

test('getSortedPageRows returns shallowly equal rows where possible', t => {
    const result0 = getSortedPageRows(state, { page: 'food' });

    t.deepEqual(result0, [
        { id: 'id19', date: DateTime.fromISO('2018-04-17'), item: 'foo3', category: 'bar3', cost: 29, shop: 'bak3', daily: 29, future: true, firstPresent: false },
        { id: 'id300', date: DateTime.fromISO('2018-02-03'), item: 'foo1', category: 'bar1', cost: 1139, shop: 'bak2', daily: null, future: false, firstPresent: true },
        { id: 'id81', date: DateTime.fromISO('2018-02-03'), item: 'foo2', category: 'bar2', cost: 876, shop: 'bak2', daily: 2015, future: false, firstPresent: false },
        { id: 'id29', date: DateTime.fromISO('2018-02-02'), item: 'foo3', category: 'bar3', cost: 498, shop: 'bak3', daily: 498, future: false, firstPresent: false }
    ]);

    const modifiedState = {
        ...state,
        now: DateTime.fromISO('2018-04-23')
    };

    const result1 = getSortedPageRows(modifiedState, { page: 'food' });

    t.is(result1[0].future, false);
    t.is(result1[0].firstPresent, true);
    t.is(result1[1].firstPresent, false);
    t.is(result1[2], result0[2]);
    t.is(result1[3], result0[3]);
});

test('getSortedPageRows memoises the result set across different pages', t => {
    const resultFood0 = getSortedPageRows(state, { page: 'food' });
    const resultGeneral0 = getSortedPageRows(state, { page: 'general' });
    const resultFood1 = getSortedPageRows(state, { page: 'food' });
    const resultGeneral1 = getSortedPageRows(state, { page: 'general' });

    t.is(resultFood0, resultFood1);
    t.is(resultGeneral0, resultGeneral1);
});

test('getSortedPageRows doesn\'t recalculate until the next day', t => {
    const getState = now => ({ ...stateWithUnorderedRows, now: DateTime.fromISO(now) });

    const resultA = getSortedPageRows(getState('2019-07-13T16:45:23Z'), { page: 'general' });
    const resultB = getSortedPageRows(getState('2019-07-13T18:23:19Z'), { page: 'general' });
    const resultC = getSortedPageRows(getState('2019-07-13T23:59:46Z'), { page: 'general' });
    const resultD = getSortedPageRows(getState('2019-07-13T23:59:59.999Z'), { page: 'general' });
    const resultE = getSortedPageRows(getState('2019-07-14T00:00:00.000'), { page: 'general' });
    const resultF = getSortedPageRows(getState('2019-07-14T00:00:00.001'), { page: 'general' });
    const resultG = getSortedPageRows(getState('2019-07-14T11:32:27Z'), { page: 'general' });

    t.is(resultA, resultB);
    t.is(resultB, resultC);
    t.is(resultC, resultD);
    t.not(resultD, resultE);
    t.is(resultE, resultF);
    t.is(resultF, resultG);
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
