import { expect } from 'chai';

import * as date from '../../src/misc/date';

describe('Date', () => {
    describe('yearMonthDifference', () => {
        it('should return the number of months from one month to another', () => {
            expect(date.yearMonthDifference([2017, 3], [2017, 9])).to.equal(6);
            expect(date.yearMonthDifference([2015, 1], [2018, 3])).to.equal(38);
        });
    });

    describe('dateInput', () => {
        it('should work for full dates', () => {
            expect(date.dateInput('22/01/2018').toISODate()).to.equal('2018-01-22');
            expect(date.dateInput('3/5/17').toISODate()).to.equal('2017-05-03');
        });

        it('should work for dates with the month', () => {
            expect(date.dateInput('1/3').toISODate()).to.equal('2018-03-01');
        });

        it('should work for just the day', () => {
            expect(date.dateInput('5').toISODate()).to.equal('2018-01-05');
        });
    });
});

