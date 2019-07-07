import { DateTime } from 'luxon';

import { testRows, testPrices, testStartTime, testCacheTimes } from '~client-test/test_data/testFunds';

export const testState = {
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    app: {
        windowWidth: 1000
    },
    login: {
        loading: false,
        error: null,
        uid: 'some-user-id',
        name: 'Some user'
    },
    api: {
        loading: false,
        error: null,
        key: 'some api key'
    },
    error: [],
    overview: {
        startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
        endDate: DateTime.fromISO('2018-06-30T23:59:59.999Z'),
        cost: {
            old: [10000, 11500, 11200],
            funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
            fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
            income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
            bills: [1000, 900, 400, 650, 0, 0, 0],
            food: [50, 13, 20, 19, 0, 0, 0],
            general: [150, 90, 10, 35, 0, 0, 0],
            holiday: [10, 1000, 95, 13, 0, 0, 0],
            social: [50, 65, 134, 10, 0, 0, 0]
        },
        data: {
            numRows: 7,
            numCols: 1
        },
        rows: [[13502], [19220], [11876], [14981], [14230], [12678], [0]]
    },
    analysis: {
        period: 'year',
        grouping: 'category',
        page: 0,
        timeline: [
            [1, 2, 3]
        ],
        treeVisible: {},
        cost: [
            ['foo2', [['foo2_bar2', 137650], ['foo2_bar1', 156842]]],
            ['foo1', [['foo1_bar1', 1642283]]]
        ],
        saved: 67123
    },
    funds: {
        items: testRows,
        viewSoldFunds: false,
        period: 'period1',
        cache: {
            period1: {
                startTime: testStartTime,
                cacheTimes: testCacheTimes,
                prices: testPrices
            }
        }
    },
    stocks: {
        loading: false,
        indices: [
            { code: 'SPX', name: 'S&P 500', gain: 0, up: false, down: false }
        ],
        shares: [],
        history: [],
        lastPriceUpdate: null
    },
    income: {
        items: []
    },
    bills: {
        items: []
    },
    food: {
        data: {
            total: 8755601
        },
        items: [
            {
                id: 'id19',
                date: DateTime.fromISO('2018-04-17'),
                item: 'foo3',
                category: 'bar3',
                cost: 29,
                shop: 'bak3'
            },
            {
                id: 'id300',
                date: DateTime.fromISO('2018-02-03'),
                item: 'foo1',
                category: 'bar1',
                cost: 1139,
                shop: 'bak2'
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
                id: 'id29',
                date: DateTime.fromISO('2018-02-02'),
                item: 'foo3',
                category: 'bar3',
                cost: 498,
                shop: 'bak3'
            }
        ]
    },
    general: {
        items: []
    },
    holiday: {
        items: []
    },
    social: {
        items: []
    }
};
