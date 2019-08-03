import test from 'ava';
import sinon from 'sinon';

import reducer, { initialState } from '~client/reducers/stocks';
import {
    stocksListCleared,
    stocksListRequested,
    stocksListReceived,
    stockQuotesReceived
} from '~client/actions/stocks';
import { loggedOut } from '~client/actions/login';

test('Null action returns the initial state', t => {
    t.is(reducer(undefined, null), initialState);
});

test('LOGGED_OUT resets the state', t => {
    t.deepEqual(reducer(undefined, loggedOut()), initialState);
});

test('STOCKS_LIST_CLEARED resets the state', t => {
    t.deepEqual(reducer({
        shares: ['some', 'shares'],
        indices: ['some', 'indices']
    }, stocksListCleared()), initialState);
});

test('STOCKS_LIST_REQUESTED sets stocks list to loading', t => {
    const state = {
        shares: [],
        loading: false
    };

    const action = stocksListRequested();

    const result = reducer(state, action);

    t.is(result.loading, true);
});

test('STOCKS_LIST_RECEIVED sets stocks list', t => {
    const state = {
        shares: [],
        loading: true
    };

    const action = stocksListReceived({
        data: {
            stocks: [
                ['LLOY.L', 'Lloyds Banking Group plc Ordinary 10p', 3],
                ['SMT.L', 'Scottish Mortgage IT Ordinary Shares 5p', 5]
            ],
            total: 11
        }
    });

    const result = reducer(state, action);

    t.deepEqual(result.shares, [
        {
            code: 'LLOY.L',
            name: 'Lloyds Banking Group plc Ordinary 10p',
            weight: 3 / 11,
            gain: 0,
            price: null,
            up: false,
            down: false
        },
        {
            code: 'SMT.L',
            name: 'Scottish Mortgage IT Ordinary Shares 5p',
            weight: 5 / 11,
            gain: 0,
            price: null,
            up: false,
            down: false
        }
    ]);

    t.is(result.loading, false);
});

test('STOCKS_LIST_RECEIVED adds duplicate stocks together', t => {
    const state = {
        shares: [],
        loading: true
    };

    const action = stocksListReceived({
        data: {
            stocks: [
                ['HKG:0700', 'TENCENT HLDGS', 3],
                ['HKG:0700', 'Tencent Holdings', 5]
            ],
            total: 11
        }
    });

    const result = reducer(state, action);

    t.deepEqual(result.shares, [
        {
            code: 'HKG:0700',
            name: 'TENCENT HLDGS',
            weight: 8 / 11,
            gain: 0,
            price: null,
            up: false,
            down: false
        }
    ]);

    t.is(result.loading, false);
});

test('STOCK_QUOTES_RECEIVED sets stock prices', t => {
    const now = new Date('2019-07-02T19:13:32+01:00');

    const clock = sinon.useFakeTimers(now.getTime());

    const state = {
        indices: [],
        shares: [
            {
                code: 'LLOY.L',
                name: 'Lloyds Banking Group plc Ordinary 10p',
                weight: 3 / 11,
                gain: 0,
                price: null,
                up: false,
                down: false
            },
            {
                code: 'SMT.L',
                name: 'Scottish Mortgage IT Ordinary Shares 5p',
                weight: 5 / 11,
                gain: 0,
                price: null,
                up: false,
                down: false
            }
        ],
        quotes: {}
    };

    const quotes = [
        {
            date: '2019-08-02T17:23:00Z',
            close: 543
        },
        {
            date: '2019-08-02T17:24:00Z',
            close: 544.5
        }
    ];

    const action = stockQuotesReceived([{ code: 'SMT.L', data: quotes }]);

    const result = reducer(state, action);

    t.deepEqual(result.quotes, {
        'SMT.L': quotes
    });

    clock.restore();
});
