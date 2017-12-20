/**
 * Misc data functions
 */

import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { fromJS, List as list } from 'immutable';
import * as M from '../../src/misc/data';
import { YMD } from '../../src/misc/date';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../../src/misc/const';

describe('misc/data', () => {
    describe('getPeriodMatch', () => {
        it('should return year1 by default', () => {
            expect(M.getPeriodMatch('foo')).to.deep.equal({ period: 'year', length: '1' });
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
            expect(M.dataEquals(new YMD([2017, 9, 1]), new YMD('1/9/17'))).to.equal(true);
            expect(M.dataEquals(new YMD([2017, 9, 1]), new YMD('2/9/17'))).to.equal(false);
        });
        it('should compare TransactionsLists', () => {
            const testList1 = new M.TransactionsList([{ 'd': '1/9/17', 'u': 2.5, 'c': 1 }]);
            const testList2 = new M.TransactionsList([{ 'd': '2/9/17', 'u': 1, 'c': 1 }]);
            const testList3 = new M.TransactionsList([{ 'd': '2017-09-01', 'u': 2.5, 'c': 1 }]);
            const testList4 = new M.TransactionsList([{ 'd': '1/9/17', 'u': 1, 'c': 1 }]);

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
            expect(M.listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 0, AVERAGE_MEDIAN))
                .to.equal(9);

            expect(M.listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 0, AVERAGE_MEDIAN))
                .to.equal(9.5);
        });
        it('should get an exponential average for a list of data', () => {
            const theList = list([1, 2, 5, 10, 10, 11, 9, 3, 20]);

            const averageExp = 13.105675146771038;

            expect(M.listAverage(theList, null, AVERAGE_EXP)).to.equal(averageExp);
        });
        it('should get the mean by default', () => {
            expect(M.listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 0))
                .to.equal(71 / 9);

            expect(M.listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 0))
                .to.equal(8.625);
        });
        it('should slice the data if requested', () => {
            expect(M.listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 3))
                .to.equal(6.5);

            expect(M.listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 3, AVERAGE_MEDIAN))
                .to.equal(10);
        });
    });
    describe('getYearMonthFromKey', () => {
        it('should return the correct year / month', () => {
            expect(M.getYearMonthFromKey(0, 2015, 9)).to.deep.equal([2015, 9]);
            expect(M.getYearMonthFromKey(1, 2015, 9)).to.deep.equal([2015, 10]);
            expect(M.getYearMonthFromKey(10, 2015, 9)).to.deep.equal([2016, 7]);
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
            expect(M.getValueForTransmit(new YMD('2017-10-11'))).to.deep.equal({
                year: 2017, month: 10, date: 11
            });
        });

        it('should return serialised transactions lists', () => {
            expect(M.getValueForTransmit(new M.TransactionsList([{ 'd': '2017-10-11', 'u': 1, 'c': 2 }])))
                .to.deep.equal([
                    { year: 2017, month: 10, date: 11, cost: 2, units: 1 }
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
    describe('getAddDefaultValues', () => {
        const pages = {
            funds: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                {
                    idCount: 0,
                    list: list.of(),
                    size: 0
                },
                0
            ],
            income: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                0
            ],
            bills: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                0
            ],
            food: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                '',
                0,
                ''
            ],
            general: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                '',
                0,
                ''
            ],
            holiday: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                '',
                0,
                ''
            ],
            social: [
                { year: 2017, month: 10, date: 14, valid: true },
                '',
                '',
                0,
                ''
            ]
        };

        it.each(Object.keys(pages), 'should return the appropriate value for each page', page => {
            const result = M.getAddDefaultValues(page);

            expect(result.toJS()).to.deep.equal(pages[page]);
        });
    });
    describe('sortRowsByDate', () => {
        it('should sort rows by date and add a daily column', () => {
            const rows = fromJS([
                {
                    id: 1,
                    cols: [new YMD('2017-10-11'), 'foo1', 'bar1', 3]
                },
                {
                    id: 2,
                    cols: [new YMD('2017-10-11'), 'foo2', 'bar2', 5]
                },
                {
                    id: 3,
                    cols: [new YMD('2017-10-12'), 'foo3', 'bar3', 11]
                }
            ]);

            const result = M.sortRowsByDate(rows, 'food');

            expect(result.toJS()).to.deep.equal([
                {
                    cols: [
                        { year: 2017, month: 10, date: 12, valid: true },
                        'foo3',
                        'bar3',
                        11
                    ],
                    daily: 22,
                    'first-present': false,
                    future: false,
                    id: 3
                },
                {
                    cols: [
                        { year: 2017, month: 10, date: 11, valid: true },
                        'foo2',
                        'bar2',
                        5
                    ],
                    'first-present': false,
                    future: false,
                    id: 2
                },
                {
                    cols: [
                        { year: 2017, month: 10, date: 11, valid: true },
                        'foo1',
                        'bar1',
                        3
                    ],
                    'first-present': false,
                    future: false,
                    id: 1
                }
            ]);
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
                    cols: [new YMD('2017-10-22'), 'foo1', 'bar1', 3]
                },
                {
                    id: 2,
                    cols: [new YMD('2017-10-12'), 'foo2', 'bar2', 10]
                },
                {
                    id: 3,
                    cols: [new YMD('2017-10-11'), 'foo3', 'bar3', 9]
                }
            ]);

            const result = M.addWeeklyAverages(data, rows, 'food');

            expect(result.toJS()).to.deep.equal({ weekly: 14 });
        });
    });
});

