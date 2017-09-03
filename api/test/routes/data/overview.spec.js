/**
 * data/overview API spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../common');
const config = require('../../../src/config')();
const overview = require('../../../src/routes/data/overview');

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

            const result = overview.getMonthlyTotalFundValues(
                yearMonths, testTransactionsProcessedResponse, testPricesProcessedResponse
            );

            const expectedResult = [
                0,
                10000,
                110000 + 200000,
                95.3 * (89.095 + 894.134) + 200000,
                99.13 * (89.095 + 894.134 - 883.229) + 56.01 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38),
                100 * (89.095 + 894.134 - 883.229) + 50.97 * (1678.42 + 846.38)
            ];

            expect(result).to.deep.equal(expectedResult);
        });
    });
});

