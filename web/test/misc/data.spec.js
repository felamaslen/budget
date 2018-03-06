/**
 * Misc data functions
 */

import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { fromJS, List as list } from 'immutable';
import * as M from '../../src/misc/data';
import { dateInput } from '../../src/misc/date';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../../src/misc/const';

describe('misc/data', () => {
    describe('getPeriodMatch', () => {
        let envBefore = null;
        before(() => {
            envBefore = process.env.DEFAULT_FUND_PERIOD;

            process.env.DEFAULT_FUND_PERIOD = 'year11';
        });

        after(() => {
            process.env.DEFAULT_FUND_PERIOD = envBefore;
        });

        it('should return env variable by default', () => {
            expect(M.getPeriodMatch('foo')).to.deep.equal({ period: 'year', length: '11' });

            process.env.DEFAULT_FUND_PERIOD = 'year11';
        });
        it('should split up a short period representation', () => {
            expect(M.getPeriodMatch('month5')).to.deep.equal({ period: 'month', length: '5' });
            expect(M.getPeriodMatch('year10')).to.deep.equal({ period: 'year', length: '10' });
        });
    });
    describe('uuid', () => {
        it('should map [0, 1] bijectively to a six-digit number', () => {
            expect(M.uuid(0.6741, true)).to.equal(109713);
            expect(M.uuid(0.99123, true)).to.equal(130497);
        });
    });
    describe('dataEquals', () => {
        it('should compare YMDs', () => {
            expect(M.dataEquals(dateInput('1/9/17'), dateInput('1/9/17'))).to.equal(true);
            expect(M.dataEquals(dateInput('1/9/17'), dateInput('2/9/17'))).to.equal(false);
        });
        it('should compare TransactionsLists', () => {
            const testList1 = new M.TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
            const testList2 = new M.TransactionsList([{ date: '2017-09-02', units: 1, cost: 1 }]);
            const testList3 = new M.TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
            const testList4 = new M.TransactionsList([{ date: '2017-09-01', units: 1, cost: 1 }]);

            expect(M.dataEquals(testList1, testList1)).to.equal(true);
            expect(M.dataEquals(testList1, testList2)).to.equal(false);
            expect(M.dataEquals(testList1, testList3)).to.equal(true);
            expect(M.dataEquals(testList1, testList4)).to.equal(false);
            expect(M.dataEquals(testList2, testList2)).to.equal(true);
            expect(M.dataEquals(testList2, testList3)).to.equal(false);
            expect(M.dataEquals(testList2, testList4)).to.equal(false);
            expect(M.dataEquals(testList3, testList3)).to.equal(true);
            expect(M.dataEquals(testList3, testList4)).to.equal(false);
        });
        it('should resort to === by default', () => {
            expect(M.dataEquals('foo', 'foo')).to.equal(true);
            expect(M.dataEquals('foo', 'bar')).to.equal(false);
            expect(M.dataEquals(0, -0)).to.equal(true);
            expect(M.dataEquals(0.4, 0)).to.equal(false);
        });
    });
    describe('listAverage', () => {
        it('should get the median of a list of data', () => {
            expect(M.listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN))
                .to.equal(9);

            expect(M.listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN))
                .to.equal(9.5);
        });
        it('should get an exponential average for a list of data', () => {
            const theList = list([1, 2, 5, 10, 10, 11, 9, 3, 20]);

            const averageExp = 13.105675146771038;

            expect(M.listAverage(theList, AVERAGE_EXP)).to.equal(averageExp);
        });
        it('should get the mean by default', () => {
            expect(M.listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20])))
                .to.equal(71 / 9);

            expect(M.listAverage(list([1, 5, 10, 10, 11, 9, 3, 20])))
                .to.equal(8.625);
        });
    });
    describe('getYearMonthFromKey', () => {
        it('should return the correct year / month', () => {
            expect(M.getYearMonthFromKey(0, 2015, 9)).to.deep.equal([2015, 9]);
            expect(M.getYearMonthFromKey(1, 2015, 9)).to.deep.equal([2015, 10]);
            expect(M.getYearMonthFromKey(10, 2015, 9)).to.deep.equal([2016, 7]);
        });
        it('should work for negative offsets', () => {
            expect(M.getYearMonthFromKey(-1, 2015, 9)).to.deep.equal([2015, 8]);
            expect(M.getYearMonthFromKey(-10, 2015, 9)).to.deep.equal([2014, 11]);
            expect(M.getYearMonthFromKey(-100, 2015, 9)).to.deep.equal([2007, 5]);
        });
    });
    describe('getKeyFromYearMonth', () => {
        it('should return the correct key', () => {
            expect(M.getKeyFromYearMonth(2016, 9, 2015, 11)).to.equal(10);
            expect(M.getKeyFromYearMonth(2017, 1, 2015, 11)).to.equal(14);
        });
    });
    describe('randnBm', () => {
        it('should return a Gaussian-incremented value from two random numbers', () => {
            expect(M.randnBm(0.13, 0.87)).to.equal(1.382792212427032);
            expect(M.randnBm(0.83, 0.876)).to.equal(0.43436275519719214);
        });
    });
    describe('getValueForTransmit', () => {
        it('should return numbers as-is', () => {
            expect(M.getValueForTransmit(10)).to.equal(10);
            expect(M.getValueForTransmit(-35.3)).to.equal(-35.3);
        });

        it('should return serialised dates', () => {
            expect(M.getValueForTransmit(dateInput('11/10/17'))).to.equal('2017-10-11');
        });

        it('should return serialised transactions lists', () => {
            expect(M.getValueForTransmit(new M.TransactionsList([{ date: '2017-10-11', units: 1, cost: 2 }])))
                .to.deep.equal([
                    { date: '2017-10-11', cost: 2, units: 1 }
                ]);
        });

        it('should return objects as-is', () => {
            expect(M.getValueForTransmit({ foo: 'bar' })).to.deep.equal({ foo: 'bar' });
        });

        it('should stringify the object, otherwise', () => {
            expect(M.getValueForTransmit('23.51')).to.equal('23.51');
            expect(M.getValueForTransmit('foobar')).to.equal('foobar');
        });
    });
    describe('getNullEditable', () => {
        it('should return a list object for list pages', () => {
            expect(M.getNullEditable('food').toJS()).to.deep.equal({
                row: -1,
                col: -1,
                page: 'food',
                id: null,
                item: null,
                value: null,
                originalValue: null
            });
        });

        it('should return a normal object for non-list pages', () => {
            expect(M.getNullEditable('overview').toJS()).to.deep.equal({
                row: 0,
                col: -1,
                page: 'overview',
                id: null,
                item: null,
                value: null,
                originalValue: null
            });
        });
    });
    describe('sortRowsByDate', () => {
        it('should sort rows by date and add a daily column', () => {
            const rows = fromJS({
                1: {
                    cols: [dateInput('11/10/17'), 'foo1', 'bar1', 3]
                },
                4: {
                    cols: [dateInput('10/10/17'), 'foo4', 'bar4', 1]
                },
                2: {
                    cols: [dateInput('11/10/17'), 'foo2', 'bar2', 5]
                },
                3: {
                    cols: [dateInput('12/10/17'), 'foo3', 'bar3', 11]
                }
            });

            const result = M.sortRowsByDate(rows, 'food');

            expect(result.map(item => item
                .setIn(['cols', 0], item.getIn(['cols', 0]).format('YYYY-MM-DD'))
            )
                .toJS()
            )
                .to.deep.equal({
                    3: {
                        cols: [
                            '2017-10-12',
                            'foo3',
                            'bar3',
                            11
                        ],
                        daily: 11,
                        'first-present': false,
                        future: false
                    },
                    2: {
                        cols: [
                            '2017-10-11',
                            'foo2',
                            'bar2',
                            5
                        ],
                        'first-present': false,
                        future: false
                    },
                    1: {
                        cols: [
                            '2017-10-11',
                            'foo1',
                            'bar1',
                            3
                        ],
                        daily: 8,
                        'first-present': false,
                        future: false
                    },
                    4: {
                        cols: [
                            '2017-10-10',
                            'foo4',
                            'bar4',
                            1
                        ],
                        'first-present': false,
                        future: false
                    }
                });
        });
    });
    describe('addWeeklyAverages', () => {
        it('should return the unprocessed data for non-daily pages', () => {
            expect(M.addWeeklyAverages({ foo: 'bar' }, [], 'funds')).to.deep.equal({ foo: 'bar' });
        });

        it('should return the data with a processed weekly value', () => {
            const data = fromJS({});

            const rows = fromJS([
                {
                    id: 1,
                    cols: [dateInput('22/10/17'), 'foo1', 'bar1', 3]
                },
                {
                    id: 2,
                    cols: [dateInput('12/10/17'), 'foo2', 'bar2', 10]
                },
                {
                    id: 3,
                    cols: [dateInput('11/10/17'), 'foo3', 'bar3', 9]
                }
            ]);

            const result = M.addWeeklyAverages(data, rows, 'food');

            expect(result.toJS()).to.deep.equal({ weekly: 14 });
        });
    });
});

