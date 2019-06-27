import test from 'ava';
import { DateTime } from 'luxon';
import {
    getDailyTotals,
    getWeeklyAverages,
    getTotalCost
} from '~client/selectors/list';
import { testRows } from '~client-test/test_data/testFunds';

const state = {
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    pages: {
        analysis: {},
        food: {
            data: {
                numRows: 3,
                numCols: 5,
                total: 8755601
            },
            rows: [
                {
                    id: '19',
                    cols: [DateTime.fromISO('2018-04-17'), 'foo3', 'bar3', 29, 'bak3']
                },
                {
                    id: '300',
                    cols: [DateTime.fromISO('2018-02-03'), 'foo1', 'bar1', 1139, 'bak1']
                },
                {
                    id: '81',
                    cols: [DateTime.fromISO('2018-02-03'), 'foo2', 'bar2', 876, 'bak2']
                },
                {
                    id: '29',
                    cols: [DateTime.fromISO('2018-02-02'), 'foo3', 'bar3', 498, 'bak3']
                }
            ]
        },
        funds: {
            rows: testRows
        }
    }
};

test('getDailyTotals calculates daily totals for list pages', t => {
    const result = getDailyTotals(state, { page: 'food' });

    t.deepEqual(result, {
        19: 29,
        81: 2015,
        29: 498
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
