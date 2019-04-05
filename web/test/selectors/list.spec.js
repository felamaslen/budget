import test from 'ava';
import { Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    makeGetDailyTotals,
    makeGetWeeklyAverages
} from '~client/selectors/list';

const state = map({
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    pages: map({
        food: map({
            data: map({
                numRows: 3,
                numCols: 5,
                total: 8755601
            }),
            rows: map([
                [19, map({
                    cols: list.of(DateTime.fromISO('2018-04-17'), 'foo3', 'bar3', 29, 'bak3')
                })],
                [300, map({
                    cols: list.of(DateTime.fromISO('2018-02-03'), 'foo1', 'bar1', 1139, 'bak1')
                })],
                [81, map({
                    cols: list.of(DateTime.fromISO('2018-02-03'), 'foo2', 'bar2', 876, 'bak2')
                })],
                [29, map({
                    cols: list.of(DateTime.fromISO('2018-02-02'), 'foo3', 'bar3', 498, 'bak3')
                })]
            ])
        })
    })
});

test('makeGetDailyTotals calculates daily totals for list pages', t => {
    const result = makeGetDailyTotals()(state, { page: 'food' });

    t.deepEqual(result.toJS(), {
        19: 29,
        81: 2015,
        29: 498
    });
});

test('makeGetWeeklyAverages returns null for non-daily pages', t => {
    t.is(makeGetWeeklyAverages()(state, { page: 'analysis' }), null);
});

test('makeGetWeeklyAverages returns the data with a processed weekly value', t => {
    t.is(makeGetWeeklyAverages()(state, { page: 'food' }),
        Math.round((29 + 1139 + 876 + 498) / 10.5477178));
});

