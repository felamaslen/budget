import { fromJS } from 'immutable';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import * as R from '../../src/reducers/overview.reducer';

describe('Overview reducer', () => {
    describe('rCalculateOverview', () => {
        const state = fromJS({
            now: DateTime.fromISO('2018-03-23T11:45:20Z'),
            pages: {
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
                    }
                }
            }
        });

        it('should handle adding income', () => {
            const result = R.rCalculateOverview({
                page: 'income',
                newDate: DateTime.fromISO('2018-04-24T10:00:11Z'),
                oldDate: DateTime.fromISO('2018-04-24T10:00:11Z'),
                newItemCost: 87054,
                oldItemCost: 0
            })(state);

            expect(result.getIn(['pages', 'overview', 'cost', 'income', 3]))
                .to.equal(2500 + 87054);
        });

        it('should handle changing dates', () => {
            const result = R.rCalculateOverview({
                page: 'food',
                newDate: DateTime.fromISO('2018-01-11T10:00:11Z'),
                oldDate: DateTime.fromISO('2018-03-18T10:00:11Z'),
                newItemCost: 19,
                oldItemCost: 19
            })(state);

            expect(result.getIn(['pages', 'overview', 'cost', 'food', 0]))
                .to.equal(50 + 19);

            expect(result.getIn(['pages', 'overview', 'cost', 'food', 2]))
                .to.equal(20 - 19);
        });
    });

    describe('processPageDataOverview', () => {
        it('should insert a simple map from the raw response', () => {
            const raw = {
                startYearMonth: [2018, 1],
                endYearMonth: [2018, 6],
                cost: {
                    balance: [13502, 19220, 11876, 14981, 14230, 12678],
                    old: [10000, 11500, 11200],
                    funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
                    fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                    income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                    bills: [1000, 900, 400, 650, 0, 0, 0],
                    food: [50, 13, 20, 19, 0, 0, 0],
                    general: [150, 90, 10, 35, 0, 0, 0],
                    holiday: [10, 1000, 95, 13, 0, 0, 0],
                    social: [50, 65, 134, 10, 0, 0, 0]
                }
            };

            const state = fromJS({
                now: DateTime.fromISO('2018-03-23T11:45:20Z'),
                pages: {}
            });

            const result = R.processPageDataOverview(state, { raw });

            expect(result.toJS()).to.deep.equal({
                now: DateTime.fromISO('2018-03-23T11:45:20Z'),
                pages: {
                    overview: {
                        startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
                        endDate: DateTime.fromISO('2018-06-30T22:59:59.999Z'),
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
                        rows: [[13502], [19220], [11876], [14981], [14230], [12678]],
                        data: {
                            numRows: 6,
                            numCols: 1
                        }
                    }
                }
            });
        });
    });
});

