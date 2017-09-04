/**
 * Common methods/functions spec
 */

const expect = require('chai').expect;

const common = require('../src/common');

describe('Common methods', () => {
    describe('monthAdd', () => {
        it('should work as expected', () => {
            expect(common.monthAdd(1, 4)).to.equal(5);
            expect(common.monthAdd(1, 11)).to.equal(12);
            expect(common.monthAdd(1, 12)).to.equal(1);
            expect(common.monthAdd(1, 19)).to.equal(8);
            expect(common.monthAdd(5, 8)).to.equal(1);
            expect(common.monthAdd(5, -5)).to.equal(12);
            expect(common.monthAdd(5, -8)).to.equal(9);
            expect(common.monthAdd(1, -13)).to.equal(12);
            expect(common.monthAdd(1, -23)).to.equal(2);
            expect(common.monthAdd(1, -26)).to.equal(11);
        });
    });

    describe('yearAddMonth', () => {
        it('should work as expected', () => {
            expect(common.yearAddMonth(2015, 1, 5)).to.equal(2015);
            expect(common.yearAddMonth(2015, 1, 11)).to.equal(2015);
            expect(common.yearAddMonth(2015, 1, 12)).to.equal(2016);
            expect(common.yearAddMonth(2015, 1, 15)).to.equal(2016);
            expect(common.yearAddMonth(2015, 9, 15)).to.equal(2016);
            expect(common.yearAddMonth(2015, 9, 16)).to.equal(2017);
            expect(common.yearAddMonth(2015, 1, -1)).to.equal(2014);
            expect(common.yearAddMonth(2015, 1, -5)).to.equal(2014);
            expect(common.yearAddMonth(2015, 1, -12)).to.equal(2014);
            expect(common.yearAddMonth(2015, 1, -13)).to.equal(2013);
            expect(common.yearAddMonth(2015, 1, -19)).to.equal(2013);
        });

        it('should accept minimum / maximum values', () => {
            expect(common.yearAddMonth(2015, 1, 12, -Infinity, 0)).to.equal(2015);
            expect(common.yearAddMonth(2015, 1, -12, 0, Infinity)).to.equal(2015);
        });
    });

    describe('getBeginningOfWeek', () => {
        it('should return the first sunday of the week', () => {
            expect(common.getBeginningOfWeek(new Date('2014-12-28')).getTime())
                .to.equal(new Date('2014-12-28').getTime());

            expect(common.getBeginningOfWeek(new Date('2015-01-03')).getTime())
                .to.equal(new Date('2014-12-28').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-03')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-04')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-05')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-06')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-07')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-08')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-09')).getTime())
                .to.equal(new Date('2017-09-03').getTime());

            expect(common.getBeginningOfWeek(new Date('2017-09-10')).getTime())
                .to.equal(new Date('2017-09-10').getTime());
        });
    });
});

