import { expect } from 'chai';

import {
    yearMonthDifference,
    monthDays
} from '../../src/misc/date';

describe('Date', () => {
    describe('yearMonthDifference', () => {
        it('should return the correct difference', () => {
            expect(yearMonthDifference([2015, 5], [2017, 3])).to.equal(22);
        });
    });

    describe('monthDays', () => {
        it('should return expected values', () => {
            expect(monthDays(1, 2017)).to.equal(31);
            expect(monthDays(2, 2017)).to.equal(28);
            expect(monthDays(2, 2016)).to.equal(29);
            expect(monthDays(2, 2000)).to.equal(29);
            expect(monthDays(2, 1900)).to.equal(28);
            expect(monthDays(3, 2017)).to.equal(31);
            expect(monthDays(4, 2017)).to.equal(30);
            expect(monthDays(5, 2017)).to.equal(31);
            expect(monthDays(6, 2017)).to.equal(30);
            expect(monthDays(7, 2017)).to.equal(31);
            expect(monthDays(8, 2017)).to.equal(31);
            expect(monthDays(9, 2017)).to.equal(30);
            expect(monthDays(10, 2017)).to.equal(31);
            expect(monthDays(11, 2017)).to.equal(30);
            expect(monthDays(12, 2017)).to.equal(31);
        });
    });
});

