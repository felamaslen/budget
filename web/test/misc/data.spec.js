/**
 * Misc data functions
 */

/* eslint-disable id-length */

import { expect } from 'chai';
import { List as list } from 'immutable';

import {
    getPeriodMatch,
    uuid,
    TransactionsList,
    dataEquals,
    listAverage,
    getYearMonthFromKey,
    getKeyFromYearMonth,
    randnBm
    // getNullEditable,
    // getAddDefaultValues,
    // sortRowsByDate,
    // addWeeklyAverages
} from '../../src/misc/data';

import { YMD } from '../../src/misc/date';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '../../src/misc/const';

describe('misc/data', () => {
    describe('getPeriodMatch', () => {
        it('should return year1 by default', () => {
            expect(getPeriodMatch('foo')).to.deep.equal({ period: 'year', length: '1' });
        });
        it('should split up a short period representation', () => {
            expect(getPeriodMatch('month5')).to.deep.equal({ period: 'month', length: '5' });
            expect(getPeriodMatch('year10')).to.deep.equal({ period: 'year', length: '10' });
        });
    });
    describe('uuid', () => {
        it('should map [0, 1] bijectively to a six-digit number', () => {
            expect(uuid(0.6741)).to.equal(109713);
            expect(uuid(0.99123)).to.equal(130497);
        });
    });
    describe('dataEquals', () => {
        it('should compare YMDs', () => {
            expect(dataEquals(new YMD([2017, 9, 1]), new YMD('1/9/17'))).to.equal(true);
            expect(dataEquals(new YMD([2017, 9, 1]), new YMD('2/9/17'))).to.equal(false);
        });
        it('should compare TransactionsLists', () => {
            const testList1 = new TransactionsList([{ d: '1/9/17', u: 2.5, c: 1 }]);
            const testList2 = new TransactionsList([{ d: '2/9/17', u: 1, c: 1 }]);
            const testList3 = new TransactionsList([{ d: '2017-09-01', u: 2.5, c: 1 }]);
            const testList4 = new TransactionsList([{ d: '1/9/17', u: 1, c: 1 }]);

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
            expect(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 0, AVERAGE_MEDIAN))
                .to.equal(9);

            expect(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 0, AVERAGE_MEDIAN))
                .to.equal(9.5);
        });
        it('should get an exponential average for a list of data', () => {
            const theList = list([1, 2, 5, 10, 10, 11, 9, 3, 20]);

            const averageExp = 13.105675146771038;

            expect(listAverage(theList, null, AVERAGE_EXP)).to.equal(averageExp);
        });
        it('should get the mean by default', () => {
            expect(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 0))
                .to.equal(71 / 9);

            expect(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 0))
                .to.equal(8.625);
        });
        it('should slice the data if requested', () => {
            expect(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), 3))
                .to.equal(6.5);

            expect(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), 3, AVERAGE_MEDIAN))
                .to.equal(10);
        });
    });
    describe('getYearMonthFromKey', () => {
        it('should return the correct year / month', () => {
            expect(getYearMonthFromKey(0, 2015, 9)).to.deep.equal([2015, 9]);
            expect(getYearMonthFromKey(1, 2015, 9)).to.deep.equal([2015, 10]);
            expect(getYearMonthFromKey(10, 2015, 9)).to.deep.equal([2016, 7]);
        });
    });
    describe('getKeyFromYearMonth', () => {
        it('should return the correct key', () => {
            expect(getKeyFromYearMonth(2016, 9, 2015, 11)).to.equal(10);
            expect(getKeyFromYearMonth(2017, 1, 2015, 11)).to.equal(14);
        });
    });
    describe('randnBm', () => {
        it('should return a Gaussian-incremented value from two random numbers', () => {
            expect(randnBm(0.13, 0.87)).to.equal(1.382792212427032);
            expect(randnBm(0.83, 0.876)).to.equal(0.43436275519719214);
        });
    });
    describe('getValueForTransmit', () => {
        it('should work');
    });
    describe('getAddDefaultValues', () => {
        it('should work');
    });
    describe('sortRowsByDate', () => {
        it('should work');
    });
    describe('addWeeklyAverages', () => {
        it('should work');
    });
});

