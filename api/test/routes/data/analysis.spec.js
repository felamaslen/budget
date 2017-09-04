/**
 * Analysis data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../test.common');
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

            const expectedConditions = [
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

            const expectedDescriptions = [
                'Week beginning Dec 28, 2014',
                'Week beginning Sep 3, 2017',
                'Week beginning Mar 27, 2016'
            ];

            const expectedResults = expectedConditions.map((condition, key) => {
                return { condition, description: expectedDescriptions[key] };
            });

            exampleDates.forEach((date, key) => {
                expect(analysis.periodConditionWeekly(date))
                    .to.deep.equal(expectedResults[key]);
            });
        });

        it('should handle pagination', () => {
            const date = new Date('2014-12-21');

            const expectedResult = index => {
                return {
                    condition: `(
                        year > 2014 OR (year = 2014 AND (
                            month > 12 OR (month = 12 AND date >= ${21 - 7 * index})
                        ))
                    ) AND (
                        year < 2014 OR (year = 2014 AND (
                            month < 12 OR (month = 12 AND date <= ${27 - 7 * index})
                        ))
                    )`.replace(/\s+/g, ' '),
                    description: `Week beginning Dec ${21 - 7 * index}, 2014`
                };
            };

            new Array(3)
                .fill(0)
                .forEach((zero, index) => {
                    expect(analysis.periodConditionWeekly(date, index))
                        .to.deep.equal(expectedResult(index));
                });
        });
    });

    describe('periodConditionMonthly', () => {
        it('should return a valid condition with the expected year and month', () => {
            expect(analysis.periodConditionMonthly(2016, 4)).to.deep.equal({
                condition: 'year = 2016 AND month = 4',
                description: 'Apr 2016'
            });

            expect(analysis.periodConditionMonthly(2015, 7)).to.deep.equal({
                condition: 'year = 2015 AND month = 7',
                description: 'Jul 2015'
            });
        });

        it('should handle pagination', () => {
            expect(analysis.periodConditionMonthly(2016, 4, 3)).to.deep.equal({
                condition: 'year = 2016 AND month = 1',
                description: 'Jan 2016'
            });

            expect(analysis.periodConditionMonthly(2017, 3, 7)).to.deep.equal({
                condition: 'year = 2016 AND month = 8',
                description: 'Aug 2016'
            });

            expect(analysis.periodConditionMonthly(2017, 3, 17)).to.deep.equal({
                condition: 'year = 2015 AND month = 10',
                description: 'Oct 2015'
            });
        });
    });

    describe('periodConditionYearly', () => {
        it('should return a valid condition with the expected year', () => {
            expect(analysis.periodConditionYearly(2015)).to.deep.equal({
                condition: 'year = 2015',
                description: '2015'
            });
        });

        it('should handle pagination', () => {
            expect(analysis.periodConditionYearly(2015, 5)).to.deep.equal({
                condition: 'year = 2010',
                description: '2010'
            });
        });
    });

    describe('periodCondition', () => {
        it('should get weekly periods', () => {
            const date = new Date('2017-09-04');

            expect(analysis.periodCondition(date, 'week')).to.deep.equal(
                analysis.periodConditionWeekly(new Date('2017-09-03'))
            );
            expect(analysis.periodCondition(date, 'week', 3)).to.deep.equal(
                analysis.periodConditionWeekly(new Date('2017-09-03'), 3)
            );
        });

        it('should get monthly periods', () => {
            const date = new Date('2017-09-04');

            expect(analysis.periodCondition(date, 'month')).to.deep.equal(
                analysis.periodConditionMonthly(2017, 9)
            );
            expect(analysis.periodCondition(date, 'month', 10)).to.deep.equal(
                analysis.periodConditionMonthly(2017, 9, 10)
            );
        });

        it('should get yearly periods', () => {
            const date = new Date('2017-09-04');

            expect(analysis.periodCondition(date, 'year')).to.deep.equal(
                analysis.periodConditionYearly(2017)
            );
            expect(analysis.periodCondition(date, 'year', 5)).to.deep.equal(
                analysis.periodConditionYearly(2017, 5)
            );
        });
    });

    describe('getPeriodCostForCategory', () => {
        it('should get valid data', async () => {
            const db = new common.DummyDbWithAnalysis();
            const user = { uid: 1 };

            const result = await analysis.getPeriodCostForCategory(
                db, user, 'year = 2015', 'food', 'category'
            );

            expect(result).to.deep.equal([
                { itemCol: 'f', cost: 10 },
                { itemCol: 'g', cost: 103 }
            ]);
        });
    });

    describe('getPeriodCost', () => {
        it('should get cost data and a period description', async () => {
            const db = new common.DummyDbWithAnalysis();
            const user = { uid: 1 };
            const now = new Date('2017-09-04');
            const period = 'month';
            const groupBy = 'category';
            const pageIndex = 0;

            const result = await analysis.getPeriodCost(
                db, user, now, period, groupBy, pageIndex
            );

            const expectedResult = {
                cost: [
                    ['bills', [
                        ['a', 999], ['b', 1923], ['c', 110], ['d', 91], ['e', 110]]
                    ],
                    ['food', [['f', 10], ['g', 103]]],
                    ['general', [['f', 10], ['g', 103]]],
                    ['holiday', [['m', 191239], ['n', 9912]]],
                    ['social', [['k', 15], ['l', 1000]]]
                ],
                description: 'Sep 2017'
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('validateParams', () => {
        it('should work for good values', () => {
            expect(analysis.validateParams('week', 'category', 0).isValid)
                .to.equal(true);
            expect(analysis.validateParams('year', 'shop', 0).isValid)
                .to.equal(true);
            expect(analysis.validateParams('month', 'shop', 3).isValid)
                .to.equal(true);
        });
        it('should reject bad periods', () => {
            expect(analysis.validateParams('foo')).to.deep.equal({
                isValid: false, param: 'period'
            });
        });
        it('should reject bad groupings', () => {
            expect(analysis.validateParams('year', 'bar')).to.deep.equal({
                isValid: false, param: 'groupBy'
            });
        });
        it('should reject bad page indices', () => {
            expect(analysis.validateParams('year', 'shop', NaN)).to.deep.equal({
                isValid: false, param: 'pageIndex'
            });
            expect(analysis.validateParams('year', 'shop', -4)).to.deep.equal({
                isValid: false, param: 'pageIndex'
            });
        });
    });
});

