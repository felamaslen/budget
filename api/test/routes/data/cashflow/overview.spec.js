/**
 * data/overview API spec
 */

/* eslint max-lines: 0 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../../test.common');
const config = require('../../../../src/config')();
const overview = require('../../../../src/routes/data/cashflow/overview');

describe('/api/data/overview', () => {
    let testPricesProcessedResponse = null;
    let testTransactionsProcessedResponse = null;

    before(() => {
        testPricesProcessedResponse = {
            '1': [
                { year: 2017, month: 9, value: 123 },
                { year: 2017, month: 8, value: 121 }
            ],
            '3': [
                { year: 2017, month: 9, value: 50.97 },
                { year: 2017, month: 8, value: 56.01 }
            ],
            '11': [
                { year: 2017, month: 9, value: 100 },
                { year: 2017, month: 8, value: 99.13 },
                { year: 2016, month: 11, value: 95.3 }
            ]
        };

        testTransactionsProcessedResponse = {
            '3': [
                { date: [2016, 9, 19], units: 1678.42, cost: 200000 },
                { date: [2017, 2, 14], units: 846.38, cost: 100000 }
            ],
            '11': [
                { date: [2016, 8, 24], units: 89.095, cost: 10000 },
                { date: [2016, 9, 19], units: 894.134, cost: 100000 },
                { date: [2017, 4, 27], units: -883.229, cost: -90000 }
            ]
        };
    });

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
        it('should handle spanning multiple years', () => {
            expect(overview.getStartYearMonth({
                now: new Date('2017-09-26'),
                pastMonths: 25
            })).to.deep.equal({
                startYear: 2015,
                startMonth: 8
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

    describe('mapOldToYearMonths', () => {
        it('should work as expected', () => {
            const yearMonths = [
                [2016, 2],
                [2016, 3],
                [2016, 4]
            ];

            const old = new Array(5).fill(0);

            const expectedResult = [
                [2015, 9],
                [2015, 10],
                [2015, 11],
                [2015, 12],
                [2016, 1]
            ];

            expect(overview.mapOldToYearMonths(yearMonths, old)).to.deep.equal(expectedResult);
        });
    });

    describe('getFundValue', () => {
        it('should get the correct fund price at a specified date', () => {
            const transactions = testTransactionsProcessedResponse['11'];
            const prices = testPricesProcessedResponse['11'];

            expect(overview.getFundValue(2016, 7, transactions, prices))
                .to.equal(0);

            expect(overview.getFundValue(2016, 8, transactions, prices))
                .to.equal(10000);

            expect(overview.getFundValue(2016, 9, transactions, prices))
                .to.equal(110000);

            expect(overview.getFundValue(2016, 11, transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134));

            expect(overview.getFundValue(2017, 1, transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134));

            expect(overview.getFundValue(2017, 4, transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134 - 883.229));

            expect(overview.getFundValue(2017, 8, transactions, prices))
                .to.equal(99.13 * (89.095 + 894.134 - 883.229));

            expect(overview.getFundValue(2017, 9, transactions, prices))
                .to.equal(100 * (89.095 + 894.134 - 883.229));
        });
    });

    describe('queryFundPrices', () => {
        it('should run the correct query', async () => {
            const db = new common.DummyDbWithFunds();

            const result = await overview.queryFundPrices(db, { uid: 1 });

            expect(result).to.deep.equal(common.testPricesQueryResponse);
        });
    });

    describe('processFundPrices', () => {
        it('should return a map of fund IDs to dated lists of prices', () => {
            const queryResult = common.testPricesQueryResponse;

            const result = overview.processFundPrices(queryResult);

            expect(result).to.deep.equal(testPricesProcessedResponse);
        });
    });

    describe('queryFundTransactions', () => {
        it('should run the correct query', async () => {
            const db = new common.DummyDbWithFunds();

            const result = await overview.queryFundTransactions(db, { uid: 1 });

            expect(result).to.deep.equal(common.testTransactionsQueryResponse);
        });
    });

    describe('processFundTransactions', () => {
        it('should return a valid map of IDs to lists of transactions', () => {
            const result = overview.processFundTransactions(common.testTransactionsQueryResponse);

            expect(result).to.deep.equal(testTransactionsProcessedResponse);
        });
    });

    describe('getMonthlyTotalFundValues', () => {
        it('should get the correct fund values', () => {
            const yearMonths = [
                [2016, 7],
                [2016, 8],
                [2016, 9],
                [2016, 11],
                [2017, 8],
                [2017, 9],
                [2018, 10]
            ];

            const old = [
                [2016, 4],
                [2016, 5],
                [2016, 6]
            ];

            const result = overview.getMonthlyTotalFundValues(
                yearMonths, old, testTransactionsProcessedResponse, testPricesProcessedResponse
            );

            const expectedResult = [
                0,
                0,
                0,
                0,
                10000,
                110000 + 200000,
                95.3 * (89.095 + 894.134) + 200000,
                99.13 * (89.095 + 894.134 - 883.229) + 56.01 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38)
            ].map(item => Math.round(item));

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getMonthlyValuesQuery', () => {
        it('should run a valid query', async () => {
            const db = new common.DummyDbWithListOverview();
            const user = { uid: 1 };
            const yearMonths = [
                [2016, 7],
                [2016, 8],
                [2016, 9]
            ];
            const category = 'food';

            const result = await overview.getMonthlyValuesQuery(db, user, yearMonths, category);

            const expectedQuery = 'SELECT SUM(cost) AS monthCost FROM (' +
                'SELECT 2016 AS year, 7 AS month ' +
                'UNION SELECT 2016, 8 ' +
                'UNION SELECT 2016, 9' +
                ') AS dates ' +
                'LEFT JOIN `food` AS list ON uid = 1 ' +
                'AND list.year = dates.year AND list.month = dates.month ' +
                'GROUP BY dates.year, dates.month';

            expect(db.queries[0]).to.equal(expectedQuery);

            expect(result).to.deep.equal([1068, 7150, 9173].map(monthCost => {
                return { monthCost };
            }));
        });
    });

    describe('getMonthlyValues', () => {
        it('should get fund values', async () => {
            const db = new common.DummyDbWithFunds();
            const user = { uid: 1 };
            const yearMonths = [
                [2017, 8],
                [2017, 9],
                [2017, 10]
            ];
            const result = await overview.getMonthlyValues(db, user, yearMonths, 'funds', []);

            expect(result).to.deep.equal([
                99.13 * (89.095 + 894.134 - 883.229) + 56.01 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38)
            ].map(item => Math.round(item)));
        });
        it('should get other values', async () => {
            const db = new common.DummyDbWithListOverview();
            const user = { uid: 1 };
            const yearMonths = [
                [2016, 7]
            ];
            const result = await overview.getMonthlyValues(db, user, yearMonths, 'food');

            expect(result).to.deep.equal([1068, 7150, 9173]);
        });
    });

    describe('getMonthlyBalanceQuery', () => {
        it('should run a valid query', async () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            const result = await overview.getMonthlyBalanceQuery(db, user);

            const expectedQuery = 'SELECT year, month, balance FROM balance WHERE uid = 1 ORDER BY year, month';

            expect(result).to.equal(expectedQuery);
        });
    });

    describe('getMonthlyBalance', () => {
        it('should return valid data', () => {
            const queryResult = [
                { year: 2014, month: 4, balance: 478293 },
                { year: 2014, month: 6, balance: 500000 },
                { year: 2014, month: 11, balance: 600000 },
                { year: 2014, month: 12, balance: 605000 },
                { year: 2015, month: 1, balance: 1200000 },
                { year: 2015, month: 2, balance: 1150000 }
            ];

            const yearMonths = [
                [2014, 9],
                [2014, 10],
                [2014, 11],
                [2014, 12],
                [2015, 1],
                [2015, 2],
                [2015, 3],
                [2015, 4]
            ];

            const result = overview.getMonthlyBalance(queryResult, yearMonths);

            const expectedResult = {
                balance: [0, 0, 600000, 605000, 1200000, 1150000, 0, 0],
                old: [478293, 0, 500000, 0, 0]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getMonthlyCategoryValues', () => {
        it('should run multiple queries in parallel and return the results', async () => {
            const db = new common.DummyDbWithListOverviewDelay();
            const user = { uid: 1 };
            const yearMonths = [
                [2016, 7],
                [2016, 8],
                [2016, 9]
            ];
            // testing category name doesn't matter
            const categories = ['food', 'general', 'someCategory', 'foo', 'bar'];

            const now = new Date().getTime();
            const result = await overview.getMonthlyCategoryValues(db, user, yearMonths, categories);

            const timeDiff = new Date().getTime() - now;
            expect(timeDiff).to.be.greaterThan(10);
            // this is impossible if the 10ms delays are sequential
            // [WARNING] on a very slow PC, this test could fail
            expect(timeDiff).to.be.lessThan(50);

            const expectedResult = {
                food: [1068, 7150, 9173],
                general: [1068, 7150, 9173],
                someCategory: [1068, 7150, 9173],
                foo: [1068, 7150, 9173],
                bar: [1068, 7150, 9173]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getData', () => {
        it('should return the correct data', async () => {
            const db = new common.DummyDb();
            const user = { uid: 1 };

            const data = await overview.getData(db, user);

            // note that we are only testing the existence of these properties here
            // the data which the properties contain are tested in other unit tests
            expect(data.startYearMonth).to.be.an('array').lengthOf(2);
            expect(data.endYearMonth).to.be.an('array').lengthOf(2);
            expect(data.currentYear).to.be.a('number');
            expect(data.currentMonth).to.be.a('number').within(1, 12);
            expect(data.futureMonths).to.be.a('number');
            expect(data.cost).to.be.an('object');
        });
    });
});

