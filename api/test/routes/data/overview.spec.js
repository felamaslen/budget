/**
 * data/overview API spec
 */

require('dotenv').config();
const expect = require('chai').expect;

const common = require('../../common');
const config = require('../../../src/config')();
const overview = require('../../../src/routes/data/overview');

describe('/api/data/overview', () => {
    let testTransactionsQueryResponse = null;
    before(() => {
        testTransactionsQueryResponse = [
            {
                id: 3,
                transactions: '[{"c":200000,"u":1678.42,"d":[2016,9,19]},{"c":100000,"u":846.38,"d":[2017,2,14]}]'
            },
            {
                id: 11,
                transactions: '[{"c":10000,"u":89.095,"d":[2016,8,24]},{"c":100000,"u":894.134,"d":[2016,9,19]},{"c":-110000,"u":-983.229,"d":[2017,4,27]}]'
            }
        ];
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
        let transactions = null;
        let prices = null;
        before(() => {
            transactions = [
                { date: [2015, 3, 25], units: 1, cost: 13 },
                { date: [2015, 3, 30], units: 5, cost: 56 },
                { date: [2015, 5, 1], units: 10, cost: 134 },
                { date: [2015, 7, 13], units: 3, cost: 76 }
            ];

            prices = [
                { year: 2015, month: 7, value: 100 },
                { year: 2015, month: 7, value: 90 },
                { year: 2015, month: 6, value: 96 },
                { year: 2015, month: 4, value: 86 }
            ];
        });

        it('should get the correct fund price at a specified date', () => {
            expect(overview.getFundValue(2015, 2, transactions, prices)).to.equal(0);
            expect(overview.getFundValue(2015, 3, transactions, prices)).to.equal(13 + 56);
            expect(overview.getFundValue(2015, 4, transactions, prices)).to.equal((1 + 5) * 86);
            expect(overview.getFundValue(2015, 5, transactions, prices)).to.equal((1 + 5 + 10) * 86);
            expect(overview.getFundValue(2015, 6, transactions, prices)).to.equal((1 + 5 + 10) * 96);
            expect(overview.getFundValue(2015, 7, transactions, prices)).to.equal((1 + 5 + 10 + 3) * 100);
            expect(overview.getFundValue(2016, 3, transactions, prices)).to.equal((1 + 5 + 10 + 3) * 100);
        });
    });

    describe('queryFundPrices', () => {
        it('should run the correct query', async () => {
            const db = new common.DummyDbWithFunds();

            const result = await overview.queryFundPrices(db, { uid: 1 });

            expect(result).to.deep.equal([
                { time: 1504285261, id: '11,3', price: '100,123' },
                { time: 1504198862, id: '3,11', price: '121,99.13' },
                { time: 1504112461, id: '11,3', price: '124.04,95.49' }
            ]);
        });
    });

    describe('processFundPrices', () => {
        it('should return a map of fund IDs to dated lists of prices', () => {
            const queryResult = [
                { time: 1504285261, id: '11,3', price: '100,123' },
                { time: 1504198862, id: '3,11', price: '121,99.13' },
                { time: 1504112461, id: '11,3', price: '124.04,95.49' }
            ];
            const result = overview.processFundPrices(queryResult);

            const expectedResult = {
                '3': [
                    { year: 2017, month: 9, price: 123 },
                    { year: 2017, month: 8, price: 121 }
                ],
                '11': [
                    { year: 2017, month: 9, price: 100 },
                    { year: 2017, month: 8, price: 99.13 }
                ]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('queryFundTransactions', () => {
        it('should run the correct query', async () => {
            const db = new common.DummyDbWithFunds();

            const result = await overview.queryFundTransactions(db, { uid: 1 });

            expect(result).to.deep.equal(testTransactionsQueryResponse);
        });
    });

    describe('processFundTransactions', () => {
        it('should return a valid map of IDs to lists of transactions', () => {
            const result = overview.processFundTransactions(testTransactionsQueryResponse);

            expect(result).to.deep.equal({
                '3': [
                    { date: [2016, 9, 19], units: 1678.42, cost: 200000 },
                    { date: [2017, 2, 14], units: 846.38, cost: 100000 }
                ],
                '11': [
                    { date: [2016, 8, 24], units: 89.095, cost: 10000 },
                    { date: [2016, 9, 19], units: 894.134, cost: 100000 },
                    { date: [2017, 4, 27], units: -983.229, cost: -110000 }
                ]
            });
        });
    });
});

