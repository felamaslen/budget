import { fromJS, Map as map, List as list } from 'immutable';
import { DateTime } from 'luxon';
import { expect } from 'chai';
import * as R from '~client/reducers/editable-updates.reducer';

describe('Editable updates reducer', () => {
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

    describe('applyEditsOverview', () => {
        it('should set the balance row to the given value', () => {
            expect(R.applyEditsOverview(state, { item: map({ row: 2, value: 14.67 }) })
                .getIn(['pages', 'overview', 'rows'])
                .toJS()
            )
                .to.deep.equal([[10], [12], [14.67], [9], [13]]);
        });
    });

    describe('applyEditsList', () => {
        it('should wait for the response reducer to handle adding items', () => {
            expect(R.applyEditsList(state, { page: 'food', item: map({ row: -1, col: 4, value: 'bak' }) })
                .getIn(['edit', 'add', 'food'])
                .toJS()
            )
                .to.deep.equal([DateTime.fromISO('2018-03-18'), 'foo', 'bar', 365, 'bak']);
        });

        describe('if editing in-place', () => {
            describe('editing cost', () => {
                const result = R.applyEditsList(state, {
                    page: 'food',
                    item: map({ row: 19, col: 3, item: 'cost', value: 33, originalValue: 29 })
                });

                it('should update the row in state', () => {
                    expect(result.getIn(['pages', 'food', 'rows', 19, 'cols', 3])).to.equal(33);
                });

                it('should recalculate the overview data properly', () => {
                    expect(result.getIn(['pages', 'overview', 'cost', 'food', 3]))
                        .to.equal(8120 + 33 - 29);
                });
                it('should recalculate the total for the page', () => {
                    expect(result.getIn(['pages', 'food', 'data', 'total']))
                        .to.equal(8755601 + 33 - 29);
                });
            });
            describe('editing date', () => {
                const result = R.applyEditsList(state, {
                    page: 'food',
                    item: map({
                        row: 300,
                        col: 0,
                        item: 'date',
                        value: DateTime.fromISO('2018-04-21'),
                        originalValue: DateTime.fromISO('2018-02-03')
                    })
                });

                it('should update the row in state', () => {
                    expect(result.getIn(['pages', 'food', 'rows', 300, 'cols', 0]))
                        .to.deep.equal(DateTime.fromISO('2018-04-21'));
                });
                it('should recalculate the overview data properly', () => {
                    expect(result.getIn(['pages', 'overview', 'cost', 'food', 1]))
                        .to.equal(1392 - 1139);
                    expect(result.getIn(['pages', 'overview', 'cost', 'food', 3]))
                        .to.equal(8120 + 1139);
                });
                it('should sort the list rows', () => {
                    expect(result.getIn(['pages', 'food', 'rows']).keySeq()
                        .toList()
                        .toJS()
                    )
                        .to.deep.equal([300, 19, 81]);
                });
            });
        });
    });

    describe('rDeleteListItem', () => {
        const result = R.rDeleteListItem(state, { page: 'food', id: 300 });

        it('should delete the row in state', () => {
            expect(result.getIn(['pages', 'food', 'rows']).keySeq()
                .toList()
                .toJS()
            )
                .to.deep.equal([19, 81]);
        });
        it('should recalculate the overview data properly', () => {
            expect(result.getIn(['pages', 'overview', 'cost', 'food', 1]))
                .to.equal(1392 - 1139);
        });
        it('should update the page total', () => {
            expect(result.getIn(['pages', 'food', 'data', 'total']))
                .to.equal(8755601 - 1139);
        });
        it('should push a request to the request queue', () => {
            expect(result.getIn(['edit', 'requestList']).toJS()).to.deep.equal([
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
    });
});

