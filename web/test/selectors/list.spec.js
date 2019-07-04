import test from 'ava';
import {
    getDailyTotals,
    getWeeklyAverages,
    getTotalCost,
    getCrudRequests
} from '~client/selectors/list';
import { testState as state } from '~client-test/test_data/state';
import { getTransactionsList } from '~client/modules/data';
import { CREATE, UPDATE, DELETE } from '~client/constants/data';

test('getDailyTotals calculates daily totals for list pages', t => {
    const result = getDailyTotals(state, { page: 'food' });

    t.deepEqual(result, {
        id19: 29,
        id81: 2015,
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
            method: 'post',
            route: 'general',
            query: {},
            body: {
                some: 'prop',
                is: 'true'
            }
        },
        {
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
