/**
 * Analysis data spec
 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const moment = require('moment');
const { prepareMockDb } = require('../../../test.common');
const analysis = require('../../../../src/routes/data/analysis');

const { db, tracker } = prepareMockDb();

describe('/data/analysis', () => {
    describe('getPeriodCostForCategory', () => {
        beforeEach(() => {
            tracker.install();

            tracker.on('query', query => {
                expect(query.method).to.equal('select');

                query.response([
                    { itemCol: 'f', cost: 10 },
                    { itemCol: 'g', cost: 103 }
                ]);
            });
        });

        afterEach(() => {
            tracker.uninstall();
        });

        it('should get valid data', async () => {
            const user = { uid: 1 };

            const result = await analysis.getPeriodCostForCategory(
                db, user, moment('2015'), moment('2016'), 'food', 'category');

            expect(result).to.deep.equal([
                { itemCol: 'f', cost: 10 },
                { itemCol: 'g', cost: 103 }
            ]);
        });
    });

    describe('getRowsByDate', () => {
        it('should work as expected', () => {
            const input = [
                [
                    { date: new Date('2015-01-10'), cost: 5 },
                    { date: new Date('2016-12-06'), cost: 10 },
                    { date: new Date('2016-12-20'), cost: 11 },
                    { date: new Date('2017-01-04'), cost: 15 },
                    { date: new Date('2017-09-03'), cost: 3 }
                ],
                [
                    { date: new Date('2015-01-10'), cost: 1 },
                    { date: new Date('2015-03-04'), cost: 50 },
                    { date: new Date('2017-05-30'), cost: 17 }
                ],
                [
                    { date: new Date('2016-04-04'), cost: 3 }
                ]
            ];

            const expectedResult = {
                2015: {
                    0: {
                        10: [5, 1]
                    },
                    2: {
                        4: [0, 50]
                    }
                },
                2016: {
                    3: {
                        4: [0, 0, 3]
                    },
                    11: {
                        6: [10],
                        20: [11]
                    }
                },
                2017: {
                    0: {
                        4: [15]
                    },
                    4: {
                        30: [0, 17]
                    },
                    8: {
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
                const data = [
                    [
                        { date: new Date('2015-01-10'), cost: 5 },
                        { date: new Date('2016-12-06'), cost: 10 },
                        { date: new Date('2016-12-20'), cost: 11 },
                        { date: new Date('2017-01-04'), cost: 15 },
                        { date: new Date('2017-09-03'), cost: 3 }
                    ],
                    [
                        { date: new Date('2015-01-10'), cost: 1 },
                        { date: new Date('2015-03-04'), cost: 50 },
                        { date: new Date('2017-05-30'), cost: 17 }
                    ],
                    [
                        { date: new Date('2016-04-04'), cost: 3 }
                    ]
                ];

                const params = { period: 'year' };

                const condition = { startTime: moment(new Date('2016-01-01')) };

                const expectedResult = [
                    ...new Array(31 + 29 + 31 + 3).fill([]),
                    [0, 0, 3],
                    ...new Array(26 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 5).fill([]),
                    [10],
                    ...new Array(13).fill([]),
                    [11],
                    ...new Array(11).fill([])
                ];

                expect(analysis.processTimelineData(data, params, condition))
                    .to.deep.equal(expectedResult);
            });
        });

        describe('for monthly data', () => {
            it('should return an item for each day in the month', () => {
                const data = [
                    [
                        { date: new Date('2015-01-10'), cost: 5 },
                        { date: new Date('2016-12-06'), cost: 10 },
                        { date: new Date('2016-12-20'), cost: 11 },
                        { date: new Date('2017-01-04'), cost: 15 },
                        { date: new Date('2017-09-03'), cost: 3 }
                    ],
                    [
                        { date: new Date('2015-01-10'), cost: 1 },
                        { date: new Date('2015-03-04'), cost: 50 },
                        { date: new Date('2017-05-30'), cost: 17 }
                    ],
                    [
                        { date: new Date('2016-04-04'), cost: 3 }
                    ]
                ];

                const params = { period: 'month' };

                const condition = { startTime: moment(new Date('2016-12-01')) };

                const expectedResult = [
                    ...new Array(5).fill([]),
                    [10],
                    ...new Array(13).fill([]),
                    [11],
                    ...new Array(11).fill([])
                ];

                expect(analysis.processTimelineData(data, params, condition))
                    .to.deep.equal(expectedResult);
            });
        });

        describe('otherwise', () => {
            it('should return null', () => {
                expect(analysis.processTimelineData([], 'notmonthoryear', {})).to.equal(null);
            });
        });
    });

    describe('getPeriodCost', () => {
        const data = {
            bills: [
                { itemCol: 'Rent', cost: 72500 },
                { itemCol: 'Electricity', cost: 3902 }
            ],
            food: [
                { itemCol: 'Breakfast', cost: 19239 },
                { itemCol: 'Lunch', cost: 91923 },
                { itemCol: 'Snacks', cost: 2239 }
            ],
            general: [
                { itemCol: 'Kitchen', cost: 1231 },
                { itemCol: 'Household', cost: 9912 }
            ],
            holiday: [
                { itemCol: 'Somewhere', cost: 11023 },
                { itemCol: 'Otherplace', cost: 23991 }
            ],
            social: [
                { itemCol: 'Friends', cost: 61923 }
            ]
        };

        beforeEach(() => {
            tracker.install();

            const queries = {
                income: {
                    match: /^select SUM\(cost\) AS cost from `income` where `date` >= \? and `date` <= \? and `uid` = \?$/,
                    response: () => [{ cost: '310342' }]
                },
                cost: {
                    match: /^select `(\w+)` as `itemCol`, SUM\(cost\) AS cost from `(\w+)` where `date` >= \? and `date` <= \? and `uid` = \? group by `itemCol`$/,
                    response: ([, , category]) => data[category]
                },
                timeline: {
                    match: /^select `date`, SUM\(cost\) AS cost from `(\w+)` where `date` >= \? and `date` <= \? and `uid` = \? group by `date`$/,
                    response: () => ([
                        { date: new Date('2017-03-01'), cost: 3 },
                        { date: new Date('2017-03-02'), cost: 4 }
                    ])
                }
            };

            tracker.on('query', query => {
                const matchingQuery = Object.keys(queries).find(
                    key => query.sql.match(queries[key].match));

                if (!matchingQuery) {
                    console.log(query.sql);
                }

                if (matchingQuery) {
                    const { match, response } = queries[matchingQuery];

                    query.response(response(query.sql.match(match)));
                }
                else {
                    query.response(null);
                }
            });
        });

        afterEach(() => {
            tracker.uninstall();
        });

        it('should get cost data and a period description', async () => {
            const user = { uid: 1 };
            const now = moment(new Date('2018-03-04'));
            const params = { period: 'month', groupBy: 'category', pageIndex: 0 };

            const result = await analysis.getPeriodCost(db, user, now, params);

            const expectedResult = {
                timeline: new Array(31).fill([]),
                cost: [
                    ['bills', [['Rent', 72500], ['Electricity', 3902]]],
                    ['food', [['Breakfast', 19239], ['Lunch', 91923], ['Snacks', 2239]]],
                    ['general', [['Kitchen', 1231], ['Household', 9912]]],
                    ['holiday', [['Somewhere', 11023], ['Otherplace', 23991]]],
                    ['social', [['Friends', 61923]]]
                ],
                saved: 12459,
                description: 'March 2018'
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

});

