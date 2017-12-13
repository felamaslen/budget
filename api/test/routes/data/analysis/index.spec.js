/**
 * Analysis data spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const analysis = require('../../../../src/routes/data/analysis');

describe('/data/analysis', () => {
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
                timeline: new Array(30).fill([]),
                cost: [
                    ['bills', [
                        ['a', 999], ['b', 1923], ['c', 110], ['d', 91], ['e', 110]]
                    ],
                    ['food', [['f', 10], ['g', 103]]],
                    ['general', [['f', 10], ['g', 103]]],
                    ['holiday', [['m', 191239], ['n', 9912]]],
                    ['social', [['k', 15], ['l', 1000]]]
                ],
                saved: 0,
                description: 'Sep 2017'
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getRowsByDate', () => {
        it('should work as expected', () => {
            const input = [
                [
                    { year: 2015, month: 1, date: 10, cost: 5 },
                    { year: 2016, month: 12, date: 6, cost: 10 },
                    { year: 2016, month: 12, date: 20, cost: 11 },
                    { year: 2017, month: 1, date: 4, cost: 15 },
                    { year: 2017, month: 9, date: 3, cost: 3 }
                ],
                [
                    { year: 2015, month: 1, date: 10, cost: 1 },
                    { year: 2015, month: 3, date: 4, cost: 50 },
                    { year: 2017, month: 5, date: 30, cost: 17 }
                ],
                [
                    { year: 2016, month: 4, date: 4, cost: 3 }
                ]
            ];

            const expectedResult = {
                2015: {
                    1: {
                        10: [5, 1]
                    },
                    3: {
                        4: [0, 50]
                    }
                },
                2016: {
                    4: {
                        4: [0, 0, 3]
                    },
                    12: {
                        6: [10],
                        20: [11]
                    }
                },
                2017: {
                    1: {
                        4: [15]
                    },
                    5: {
                        30: [0, 17]
                    },
                    9: {
                        3: [3]
                    }
                }
            };

            expect(analysis.getRowsByDate(input)).to.deep.equal(expectedResult);
        });
    });

    describe('processTimelineData', () => {
        describe('for yearly data', () => {
            it('should return an item for each day in the year', () => {
                const results = [
                    [
                        { year: 2015, month: 1, date: 10, cost: 5 },
                        { year: 2016, month: 12, date: 6, cost: 10 },
                        { year: 2016, month: 12, date: 20, cost: 11 },
                        { year: 2017, month: 1, date: 4, cost: 15 },
                        { year: 2017, month: 9, date: 3, cost: 3 }
                    ],
                    [
                        { year: 2015, month: 1, date: 10, cost: 1 },
                        { year: 2015, month: 3, date: 4, cost: 50 },
                        { year: 2017, month: 5, date: 30, cost: 17 }
                    ],
                    [
                        { year: 2016, month: 4, date: 4, cost: 3 }
                    ]
                ];

                const period = 'year';
                const params = { year: 2016 };

                const expectedResult = [
                    ...new Array(31 + 29 + 31 + 3).fill([]),
                    [0, 0, 3],
                    ...new Array(26 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 5).fill([]),
                    [10],
                    ...new Array(13).fill([]),
                    [11],
                    ...new Array(11).fill([])
                ];

                expect(analysis.processTimelineData(results, period, params)).to.deep.equal(expectedResult);
            });
        });

        describe('for monthly data', () => {
            it('should return an item for each day in the month', () => {
                const results = [
                    [
                        { year: 2015, month: 1, date: 10, cost: 5 },
                        { year: 2016, month: 12, date: 6, cost: 10 },
                        { year: 2016, month: 12, date: 20, cost: 11 },
                        { year: 2017, month: 1, date: 4, cost: 15 },
                        { year: 2017, month: 9, date: 3, cost: 3 }
                    ],
                    [
                        { year: 2015, month: 1, date: 10, cost: 1 },
                        { year: 2015, month: 3, date: 4, cost: 50 },
                        { year: 2017, month: 5, date: 30, cost: 17 }
                    ],
                    [
                        { year: 2016, month: 4, date: 4, cost: 3 }
                    ]
                ];

                const period = 'month';
                const params = { year: 2016, month: 12 };

                const expectedResult = [
                    ...new Array(5).fill([]),
                    [10],
                    ...new Array(13).fill([]),
                    [11],
                    ...new Array(11).fill([])
                ];

                expect(analysis.processTimelineData(results, period, params)).to.deep.equal(expectedResult);
            });
        });

        describe('otherwise', () => {
            it('should return null', () => {
                expect(analysis.processTimelineData([], 'notmonthoryear', {})).to.equal(null);
            });
        });
    });
});

