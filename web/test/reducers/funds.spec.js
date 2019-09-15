import test from 'ava';
import sinon from 'sinon';
import shortid from 'shortid';

import reducer, { initialState } from '~client/reducers/funds';
import { dataRead } from '~client/actions/api';
import {
    fundsViewSoldToggled,
    fundsReceived,
} from '~client/actions/funds';
import { getTransactionsList } from '~client/modules/data';
import { DATA_KEY_ABBR } from '~client/constants/data';

test('FUNDS_VIEW_SOLD_TOGGLED toggles the view sold status', (t) => {
    const action = fundsViewSoldToggled();

    t.true(reducer({ viewSoldFunds: false }, action).viewSoldFunds);
    t.false(reducer({ viewSoldFunds: true }, action).viewSoldFunds);
});

test('DATA_READ sets funds-related properties', (t) => {
    const stub = sinon.stub(shortid, 'generate').returns('my-short-id');

    const state = initialState;

    t.truthy(state.period);

    const res = {
        funds: {
            startTime: 1000,
            cacheTimes: [1, 2, 100, 183],
            data: [
                {
                    [DATA_KEY_ABBR.id]: 'id-1',
                    [DATA_KEY_ABBR.item]: 'My fund 1',
                    [DATA_KEY_ABBR.transactions]: [
                        { date: '2019-06-30', units: 100, cost: 9923 },
                    ],
                    pr: [45, 45.6, 44.9],
                    prStartIndex: 1,
                },
                {
                    [DATA_KEY_ABBR.id]: 'id-2',
                    [DATA_KEY_ABBR.item]: 'My fund 2',
                    [DATA_KEY_ABBR.transactions]: [],
                    pr: [101.2, 100.94, 101.4, 102.03],
                    prStartIndex: 0,
                },
            ],
        },
    };

    const action = dataRead(res, null);

    const result = reducer(state, action);

    t.deepEqual(result, {
        ...state,
        items: [
            {
                id: 'id-1',
                item: 'My fund 1',
                transactions: getTransactionsList([{ date: '2019-06-30', units: 100, cost: 9923 }]),
            },
            { id: 'id-2', item: 'My fund 2', transactions: [] },
        ],
        cache: {
            [state.period]: {
                startTime: 1000,
                cacheTimes: [1, 2, 100, 183],
                prices: {
                    'id-1': { startIndex: 1, values: [45, 45.6, 44.9] },
                    'id-2': { startIndex: 0, values: [101.2, 100.94, 101.4, 102.03] },
                },
            },
        },
    });

    stub.restore();
});

test('FUNDS_RECEIVED sets funds-related properties in new period', (t) => {
    const stub = sinon.stub(shortid, 'generate').returns('my-short-id');

    const state = initialState;

    const res = {
        data: {
            startTime: 1430,
            cacheTimes: [2, 100, 183],
            data: [
                {
                    [DATA_KEY_ABBR.id]: 'id-1',
                    [DATA_KEY_ABBR.item]: 'My fund 1',
                    [DATA_KEY_ABBR.transactions]: [
                        { date: '2019-06-30', units: 100, cost: 9923 },
                    ],
                    pr: [45.6, 44.9],
                    prStartIndex: 1,
                },
                {
                    [DATA_KEY_ABBR.id]: 'id-2',
                    [DATA_KEY_ABBR.item]: 'My fund 2',
                    [DATA_KEY_ABBR.transactions]: [],
                    pr: [100.94, 101.4, 102.03],
                    prStartIndex: 0,
                },
            ],
        },
    };

    t.not(state.period, 'month3');

    const action = fundsReceived('month3', res);

    const result = reducer(state, action);

    t.is(result.items, state.items);
    t.is(result.cache[state.period], state.cache[state.period]);

    t.deepEqual(result.cache.month3, {
        startTime: 1430,
        cacheTimes: [2, 100, 183],
        prices: {
            'id-1': { startIndex: 1, values: [45.6, 44.9] },
            'id-2': { startIndex: 0, values: [100.94, 101.4, 102.03] },
        },
    });

    t.is(result.period, 'month3');

    stub.restore();
});

test('FUNDS_RECEIVED just sets the period, if the data already exist', (t) => {
    const stub = sinon.stub(shortid, 'generate').returns('my-short-id');

    const state = initialState;

    t.not(state.period, 'month3');

    const action = fundsReceived('month3');

    const result = reducer(state, action);

    t.is(result.items, state.items);
    t.is(result.cache, state.cache);

    t.is(result.period, 'month3');

    stub.restore();
});
