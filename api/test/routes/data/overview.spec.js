/**
 * data/overview API spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const config = require('../../../src/config')();
const overview = require('../../../src/routes/data/overview');

describe('/api/data/overview', () => {
    describe('getStartYearMonth', () => {
        it('should get the correct start year/month', () => {
            expect(overview.getStartYearMonth({
                now: new Date('2015-04-26'),
                pastMonths: 5
            })).to.deep.equal({
                startYear: 2014,
                startMonth: 11
            });
        });
        it('should handle configured limit', () => {
            expect(overview.getStartYearMonth({
                now: new Date(config.data.overview.startYear, config.data.overview.startMonth + 2),
                pastMonths: 5
            })).to.deep.equal({
                startYear: config.data.overview.startYear,
                startMonth: config.data.overview.startMonth
            });
        });
    });

    describe('getEndYearMonth', () => {
        it('should get the correct end year/month', () => {
            expect(overview.getEndYearMonth({
                now: new Date('2015-04-13'),
                futureMonths: 5
            })).to.deep.equal({
                endYear: 2015,
                endMonth: 9
            });

            expect(overview.getEndYearMonth({
                now: new Date('2015-10-23'),
                futureMonths: 3
            })).to.deep.equal({
                endYear: 2016,
                endMonth: 1
            });
        });
    });

    describe('getYearMonths', () => {
        it('should return a list of [year, month] arrays', () => {
            expect(overview.getYearMonths({
                now: new Date('2015-06-13'),
                pastMonths: 5,
                futureMonths: 4,
                startYear: 2014,
                startMonth: 9
            })).to.deep.equal([
                [2015, 1],
                [2015, 2],
                [2015, 3],
                [2015, 4],
                [2015, 5],
                [2015, 6],
                [2015, 7],
                [2015, 8],
                [2015, 9],
                [2015, 10]
            ]);
        });

        it('should handle overlaps with previous / next year', () => {
            expect(overview.getYearMonths({
                now: new Date('2015-02-23'),
                pastMonths: 3,
                futureMonths: 1,
                startYear: 2014,
                startMonth: 9
            })).to.deep.equal([
                [2014, 11],
                [2014, 12],
                [2015, 1],
                [2015, 2],
                [2015, 3]
            ]);

            expect(overview.getYearMonths({
                now: new Date('2015-10-23'),
                pastMonths: 1,
                futureMonths: 3,
                startYear: 2014,
                startMonth: 9
            })).to.deep.equal([
                [2015, 9],
                [2015, 10],
                [2015, 11],
                [2015, 12],
                [2016, 1]
            ]);
        });
    });
});

