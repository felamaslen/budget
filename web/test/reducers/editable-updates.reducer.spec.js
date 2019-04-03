import test from 'ava';
import { fromJS, Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    applyEditsOverview,
    applyEditsList,
    rDeleteListItem
} from '~client/reducers/editable-updates.reducer';

const state = map({
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    edit: map({
        add: map({
            food: list.of(DateTime.fromISO('2018-03-18'), 'foo', 'bar', 365, 'baz')
        }),
        requestList: list.of()
    }),
    pages: map({
        overview: map({
            rows: fromJS([[10], [12], [14], [9], [13]]),
            startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
            endDate: DateTime.fromISO('2018-06-30T23:59:59.999Z'),
            cost: fromJS({
                old: [10000, 11500, 11200],
                funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
                fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [5078, 1392, 2003, 8120, 0, 0, 0],
                general: [150, 90, 10, 35, 0, 0, 0],
                holiday: [10, 1000, 95, 13, 0, 0, 0],
                social: [50, 65, 134, 10, 0, 0, 0]
            }),
            data: map({
                numRows: 7,
                numCols: 1
            })
        }),
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
                })]
            ])
        })
    })
});

test('applyEditsOverview seting the balance row to the given value', t => {
    t.deepEqual(
        applyEditsOverview(state, { item: map({ row: 2, value: 14.67 }) })
            .getIn(['pages', 'overview', 'rows'])
            .toJS(),
        [[10], [12], [14.67], [9], [13]]
    );
});

test('applyEditsList waiting for the response reducer to handle adding items', t => {
    t.deepEqual(
        applyEditsList(state, { page: 'food', item: map({ row: -1, col: 4, value: 'bak' }) })
            .getIn(['edit', 'add', 'food'])
            .toJS(),
        [DateTime.fromISO('2018-03-18'), 'foo', 'bar', 365, 'bak']
    );
});

const resultEditingInPlaceCost = applyEditsList(state, {
    page: 'food',
    item: map({ row: 19, col: 3, item: 'cost', value: 33, originalValue: 29 })
});

test('applyEditsList (in-place, editing cost) updateing the row in state', t => {
    t.is(resultEditingInPlaceCost.getIn(['pages', 'food', 'rows', 19, 'cols', 3]), 33);
});

test('applyEditsList (in-place, editing cost) recalculateing the overview data properly', t => {
    t.is(resultEditingInPlaceCost.getIn(['pages', 'overview', 'cost', 'food', 3]), 8120 + 33 - 29);
});
test('applyEditsList (in-place, editing cost) recalculateing the total for the page', t => {
    t.is(resultEditingInPlaceCost.getIn(['pages', 'food', 'data', 'total']), 8755601 + 33 - 29);
});

const resultEditingInPlaceDate = applyEditsList(state, {
    page: 'food',
    item: map({
        row: 300,
        col: 0,
        item: 'date',
        value: DateTime.fromISO('2018-04-21'),
        originalValue: DateTime.fromISO('2018-02-03')
    })
});

test('applyEditsList (in-place, editing date) updateing the row in state', t => {
    t.deepEqual(resultEditingInPlaceDate.getIn(['pages', 'food', 'rows', 300, 'cols', 0]), DateTime.fromISO('2018-04-21'));
});
test('applyEditsList (in-place, editing date) recalculateing the overview data properly', t => {
    t.is(resultEditingInPlaceDate.getIn(['pages', 'overview', 'cost', 'food', 1]), 1392 - 1139);
    t.is(resultEditingInPlaceDate.getIn(['pages', 'overview', 'cost', 'food', 3]), 8120 + 1139);
});
test('applyEditsList (in-place, editing date) sorting the list rows', t => {
    t.deepEqual(
        resultEditingInPlaceDate.getIn(['pages', 'food', 'rows']).keySeq()
            .toList()
            .toJS(),
        [300, 19, 81]
    );
});

const resultDelete = rDeleteListItem(state, { page: 'food', id: 300 });

test('rDeleteListItem deleteing the row in state', t => {
    t.deepEqual(
        resultDelete.getIn(['pages', 'food', 'rows']).keySeq()
            .toList()
            .toJS(),
        [19, 81]
    );
});

test('rDeleteListItem recalculateing the overview data properly', t => {
    t.is(resultDelete.getIn(['pages', 'overview', 'cost', 'food', 1]), 1392 - 1139);
});

test('rDeleteListItem updateing the page total', t => {
    t.is(resultDelete.getIn(['pages', 'food', 'data', 'total']), 8755601 - 1139);
});

test('rDeleteListItem pushing a request to the request queue', t => {
    t.deepEqual(resultDelete.getIn(['edit', 'requestList']).toJS(), [
        {
            req: {
                body: {
                    id: 300
                },
                method: 'delete',
                query: {},
                route: 'food'
            }
        }
    ]);
});

