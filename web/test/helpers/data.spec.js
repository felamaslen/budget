/**
 * Misc data functions
 */

import { expect } from 'chai';
import itEach from 'it-each';
itEach();
import { fromJS, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    getPeriodMatch,
    uuid,
    TransactionsList,
    dataEquals,
    listAverage,
    randnBm,
    getValueForTransmit,
    getNullEditable,
    getAddDefaultValues,
    sortRowsByDate
} from '../../src/helpers/data';
import { dateInput } from '../../src/helpers/date';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../../src/constants';

describe('helpers/data', () => {
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
            expect(getPeriodMatch('foo')).to.deep.equal({ period: 'year', length: '11' });

            process.env.DEFAULT_FUND_PERIOD = 'year11';
        });
        it('should split up a short period representation', () => {
            expect(getPeriodMatch('month5')).to.deep.equal({ period: 'month', length: '5' });
            expect(getPeriodMatch('year10')).to.deep.equal({ period: 'year', length: '10' });
        });
    });
    describe('uuid', () => {
        it('should map [0, 1] bijectively to a six-digit number', () => {
            expect(uuid(0.6741, true)).to.equal(109713);
            expect(uuid(0.99123, true)).to.equal(130497);
        });
    });

    describe('TransactionsList', () => {
        const data = [
            {
                date: '2017-05-08T23:00:00.000Z',
                units: 934,
                cost: 399924
            },
            {
                date: '2018-03-13T00:00:00.000Z',
                units: 25,
                cost: -10512
            },
            {
                date: '2018-06-06T23:00:00.000Z',
                units: -1239,
                cost: -539814
            },
            {
                date: '2018-04-25T23:00:00.000Z',
                units: 280,
                cost: 119931
            }
        ];

        const shortList = new TransactionsList(data, true);

        const longList = new TransactionsList(shortList.list, false);

        it.each([shortList, longList], 'should return a list as valueOf()', transactions => {
            const value = transactions.valueOf();

            expect(value).to.be.instanceof(list);
            expect(value.size).to.equal(4);
        });

        it.each([shortList, longList], 'should return a raw array from format(), ordered by date', transactions => {
            expect(transactions.format()).to.deep.equal([
                {
                    date: '2017-05-09',
                    units: 934,
                    cost: 399924
                },
                {
                    date: '2018-03-13',
                    units: 25,
                    cost: -10512
                },
                {
                    date: '2018-04-26',
                    units: 280,
                    cost: 119931
                },
                {
                    date: '2018-06-07',
                    units: -1239,
                    cost: -539814
                }
            ]);
        });

        it.each([shortList, longList], 'should have a method to remove items by their index', transactions => {
            const removed = transactions.remove(0);

            expect(removed).to.be.instanceof(TransactionsList);
            expect(removed.size).to.equal(3);
        });

        it.each([shortList, longList], 'should have a method to push an item', transactions => {
            const pushed = transactions.push({
                date: '2018-09-13T03:20Z',
                units: 20,
                cost: 3
            });

            expect(pushed).to.be.instanceof(TransactionsList);
            expect(pushed.size).to.equal(5);
        });

        it.each([shortList, longList], 'should have a method to get the total units', transactions => {
            expect(transactions.getTotalUnits()).to.equal(0);

            expect(transactions.remove(3).getTotalUnits()).to.equal(1239);
        });

        it.each([shortList, longList], 'should have a method to get the total cost', transactions => {
            expect(transactions.getTotalCost()).to.equal(-30471);
        });

        it.each([shortList, longList], 'should have a method to determine if the holding is sold', transactions => {
            expect(transactions.isSold()).to.equal(true);

            expect(transactions.setIn([3, 'units'], -1238).isSold()).to.equal(false);
        });

        it('should handle rounding errors', () => {
            const listWithErrors = new TransactionsList([
                {
                    date: '2016-09-19T05:00Z',
                    units: 1678.42,
                    cost: 2000
                },
                {
                    date: '2017-02-14T05:00Z',
                    units: 846.38,
                    cost: 1000
                },
                {
                    date: '2017-10-25T05:00Z',
                    units: 817,
                    cost: 1000
                },
                {
                    date: '2018-03-14T05:00Z',
                    units: 1217.43,
                    cost: 1500
                },
                {
                    date: '2018-09-24T05:00Z',
                    units: -4559.23,
                    cost: -5595.2
                }
            ]);

            expect(listWithErrors.getTotalUnits()).to.equal(0);

            expect(listWithErrors.isSold()).to.equal(true);
        });
    });

    describe('dataEquals', () => {
        it('should compare YMDs', () => {
            expect(dataEquals(dateInput('1/9/17'), dateInput('1/9/17'))).to.equal(true);
            expect(dataEquals(dateInput('1/9/17'), dateInput('2/9/17'))).to.equal(false);
        });
        it('should compare TransactionsLists', () => {
            const testList1 = new TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
            const testList2 = new TransactionsList([{ date: '2017-09-02', units: 1, cost: 1 }]);
            const testList3 = new TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
            const testList4 = new TransactionsList([{ date: '2017-09-01', units: 1, cost: 1 }]);

            expect(dataEquals(testList1, testList1)).to.equal(true);
            expect(dataEquals(testList1, testList2)).to.equal(false);
            expect(dataEquals(testList1, testList3)).to.equal(true);
            expect(dataEquals(testList1, testList4)).to.equal(false);
            expect(dataEquals(testList2, testList2)).to.equal(true);
            expect(dataEquals(testList2, testList3)).to.equal(false);
            expect(dataEquals(testList2, testList4)).to.equal(false);
            expect(dataEquals(testList3, testList3)).to.equal(true);
            expect(dataEquals(testList3, testList4)).to.equal(false);
        });
        it('should resort to === by default', () => {
            expect(dataEquals('foo', 'foo')).to.equal(true);
            expect(dataEquals('foo', 'bar')).to.equal(false);
            expect(dataEquals(0, -0)).to.equal(true);
            expect(dataEquals(0.4, 0)).to.equal(false);
        });
    });
    describe('listAverage', () => {
        it('should get the median of a list of data', () => {
            expect(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN))
                .to.equal(9);

            expect(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN))
                .to.equal(9.5);
        });
        it('should get an exponential average for a list of data', () => {
            const theList = list([1, 2, 5, 10, 10, 11, 9, 3, 20]);

            const averageExp = 13.105675146771038;

            expect(listAverage(theList, AVERAGE_EXP)).to.equal(averageExp);
        });
        it('should get the mean by default', () => {
            expect(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20])))
                .to.equal(71 / 9);

            expect(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20])))
                .to.equal(8.625);
        });
    });
    describe('randnBm', () => {
        it('should return a Gaussian-incremented value from two random numbers', () => {
            expect(randnBm(0.13, 0.87)).to.equal(1.382792212427032);
            expect(randnBm(0.83, 0.876)).to.equal(0.43436275519719214);
        });
    });
    describe('getValueForTransmit', () => {
        it('should return numbers as-is', () => {
            expect(getValueForTransmit(10)).to.equal(10);
            expect(getValueForTransmit(-35.3)).to.equal(-35.3);
        });

        it('should return serialised dates', () => {
            expect(getValueForTransmit(dateInput('11/10/17'))).to.equal('2017-10-11');
        });

        it('should return serialised transactions lists', () => {
            expect(getValueForTransmit(new TransactionsList([{ date: '2017-10-11', units: 1, cost: 2 }])))
                .to.deep.equal([
                    { date: '2017-10-11', cost: 2, units: 1 }
                ]);
        });

        it('should return objects as-is', () => {
            expect(getValueForTransmit({ foo: 'bar' })).to.deep.equal({ foo: 'bar' });
        });

        it('should stringify the object, otherwise', () => {
            expect(getValueForTransmit('23.51')).to.equal('23.51');
            expect(getValueForTransmit('foobar')).to.equal('foobar');
        });
    });
    describe('getNullEditable', () => {
        it('should return a list object for list pages', () => {
            expect(getNullEditable('food').toJS()).to.deep.equal({
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
            expect(getNullEditable('overview').toJS()).to.deep.equal({
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
        it('should get the right values for the food page', () => {
            const now = DateTime.local();

            expect(getAddDefaultValues('food', now).toJS())
                .to.deep.equal([
                    now,
                    '',
                    '',
                    0,
                    ''
                ]);
        });
    });
    describe('sortRowsByDate', () => {
        it('should sort rows by date', () => {
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
                    cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 13 }), 'foo3', 'bar3', 11]
                },
                5: {
                    cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 11 }), 'foo5', 'bar5', 13]
                }
            });

            const sortedRows = sortRowsByDate(rows, 'food');

            expect(sortedRows.map(item => item
                .setIn(['cols', 0], item.getIn(['cols', 0]).toISODate())
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
                        'first-present': false,
                        future: false
                    },
                    5: {
                        cols: [
                            '2017-10-12',
                            'foo5',
                            'bar5',
                            13
                        ],
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
});

