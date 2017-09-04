/**
 * Analysis data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const analysis = require('../../../src/routes/data/analysis');

describe('/data/analysis', () => {
    describe('getCategoryColumn', () => {
        it('should return a group as expected', () => {
            expect(analysis.getCategoryColumn('bills')).to.equal('item');
            expect(analysis.getCategoryColumn('food', 'category')).to.equal('category');
            expect(analysis.getCategoryColumn('general', 'category')).to.equal('category');
            expect(analysis.getCategoryColumn('social', 'category')).to.equal('society');
            expect(analysis.getCategoryColumn('holiday', 'category')).to.equal('holiday');
            expect(analysis.getCategoryColumn(null, 'category')).to.equal('item');
            expect(analysis.getCategoryColumn(null, 'shop')).to.equal('shop');

            expect(analysis.getCategoryColumn(null, null)).to.equal(null);
        });
    });

    describe('periodConditionWeekly', () => {
        // database query for weekly period
        it('should return the correct query', () => {
            const exampleDates = [
                new Date('2014-12-28'),
                new Date('2017-09-03'),
                new Date('2016-03-27')
            ];

            const expectedResults = [
                `(
                    year > 2014 OR (year = 2014 AND (
                        month > 12 OR (month = 12 AND date >= 28)
                    ))
                ) AND (
                    year < 2015 OR (year = 2015 AND (
                        month < 1 OR (month = 1 AND date <= 3)
                        ))
                )`,
                `(
                    year > 2017 OR (year = 2017 AND (
                        month > 9 OR (month = 9 AND date >= 3)
                    ))
                ) AND (
                    year < 2017 OR (year = 2017 AND (
                        month < 9 OR (month = 9 AND date <= 9)
                    ))
                )`,
                `(
                    year > 2016 OR (year = 2016 AND (
                        month > 3 OR (month = 3 AND date >= 27)
                    ))
                ) AND (
                    year < 2016 OR (year = 2016 AND (
                        month < 4 OR (month = 4 AND date <= 2)
                    ))
                )`
            ].map(string => string.replace(/\s+/g, ' '));

            exampleDates.forEach((date, key) => {
                expect(analysis.periodConditionWeekly(date))
                    .to.equal(expectedResults[key]);
            });
        });

        it('should handle pagination', () => {
            const date = new Date('2014-12-21');

            const expectedResult = index => {
                return `(
                    year > 2014 OR (year = 2014 AND (
                        month > 12 OR (month = 12 AND date >= ${21 - 7 * index})
                    ))
                ) AND (
                    year < 2014 OR (year = 2014 AND (
                        month < 12 OR (month = 12 AND date <= ${27 - 7 * index})
                    ))
                )`.replace(/\s+/g, ' ');
            };

            new Array(3)
                .fill(0)
                .forEach((zero, index) => {
                    expect(analysis.periodConditionWeekly(date, index))
                        .to.equal(expectedResult(index));
                });
        });
    });
});

