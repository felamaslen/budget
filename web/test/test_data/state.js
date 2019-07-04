import { DateTime } from 'luxon';

import { testRows, testPrices, testStartTime, testCacheTimes } from '~client-test/test_data/testFunds';
import { GRAPH_FUNDS_MODE_ROI } from '~client/constants/graph';

export const testState = {
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
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
    edit: {
        active: {
            row: '10',
            col: 2
        }
    },
    editSuggestions: {
        list: [],
        active: -1
    },
    other: {
        windowWidth: 1000,
        graphFunds: {
            mode: GRAPH_FUNDS_MODE_ROI,
            period: 'period1',
            zoomRange: [-Infinity, Infinity],
            enabledList: [
                { id: 'overall', enabled: true },
                { id: '10', enabled: true },
                { id: '1', enabled: true },
                { id: '3', enabled: true },
                { id: '11', enabled: false }
            ]
        }
    }
};
