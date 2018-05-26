/**
 * data/overview API spec
 */

/* eslint max-lines: 0 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const { prepareMockDb } = require('../../../test.common');
const { DateTime } = require('luxon');

const common = require('../../../test.common');
const config = require('../../../../src/config')();
const overview = require('../../../../src/routes/data/cashflow/overview');

const { db, tracker } = prepareMockDb();

const testPricesProcessedResponse = {
    '1': [
        { date: new Date('2017-09-30 23:59:59.999'), value: 95.49 },
        { date: new Date('2017-08-31 23:59:59.999'), value: 121 }
    ],
    '3': [
        { date: new Date('2017-09-30 23:59:59.999'), value: 49.52 },
        { date: new Date('2017-08-31 23:59:59.999'), value: 56.01 }
    ],
    '11': [
        { date: new Date('2017-09-30 23:59:59.999'), value: 124.04 },
        { date: new Date('2017-08-31 23:59:59.999'), value: 99.13 },
        { date: new Date('2016-11-30 23:59:59.999'), value: 95.3 }
    ]
};

const testTransactionsProcessedResponse = {
    '3': [
        { date: DateTime.fromJSDate(new Date('2016-09-19')), units: 1678.42, cost: 200000 },
        { date: DateTime.fromJSDate(new Date('2017-02-14')), units: 846.38, cost: 100000 }
    ],
    '11': [
        { date: DateTime.fromJSDate(new Date('2016-08-24')), units: 89.095, cost: 10000 },
        { date: DateTime.fromJSDate(new Date('2016-09-19')), units: 894.134, cost: 100000 },
        { date: DateTime.fromJSDate(new Date('2017-04-27')), units: -883.229, cost: -90000 }
    ]
};

describe('/api/data/overview', () => {
    describe('getStartTime', () => {
        it('should get the correct start time', () => {
            expect(overview.getStartTime({
                now: DateTime.fromISO('2015-04-26'),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 5
            }).toISODate()).to.equal('2014-11-26');
        });
        it('should handle spanning multiple years', () => {
            expect(overview.getStartTime({
                now: DateTime.fromISO('2017-09-21'),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 15
            }).toISODate()).to.equal('2016-06-21');
        });
        it('should handle configured limit', () => {
            expect(overview.getStartTime({
                now: DateTime.fromISO('2014-11-01'),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 5
            }).toISODate()).to.equal('2014-10-01');
        });
    });

    describe('getMonths', () => {
        it('should return a list of dates corresponding to each month', () => {
            expect(overview.getMonths({
                now: DateTime.fromISO('2015-06-13'),
                pastMonths: 5,
                futureMonths: 8,
                startYear: 2014,
                startMonth: 9
            }).map(date => date.toISODate())).to.deep.equal([
                '2015-01-31',
                '2015-02-28',
                '2015-03-31',
                '2015-04-30',
                '2015-05-31',
                '2015-06-30',
                '2015-07-31',
                '2015-08-31',
                '2015-09-30',
                '2015-10-31',
                '2015-11-30',
                '2015-12-31',
                '2016-01-31',
                '2016-02-29'
            ]);
        });
    });

    describe('mapOldToYearMonths', () => {
        it('should work as expected', () => {
            const months = [
                DateTime.fromISO('2016-02-29'),
                DateTime.fromISO('2016-03-31'),
                DateTime.fromISO('2016-04-30')
            ];

            const old = new Array(5).fill(0);

            const expectedResult = [
                '2015-09-29',
                '2015-10-29',
                '2015-11-29',
                '2015-12-29',
                '2016-01-29'
            ];

            expect(overview.mapOldToYearMonths(months, old)
                .map(date => date.toISODate())
            )
                .to.deep.equal(expectedResult);
        });
    });

    describe('getFundValue', () => {
        it('should get the correct fund price at a specified date', () => {
            const transactions = testTransactionsProcessedResponse['11'];
            const prices = testPricesProcessedResponse['11'];

            expect(overview.getFundValue(new Date('2016-07-31'), transactions, prices))
                .to.equal(0);

            expect(overview.getFundValue(new Date('2016-08-31'), transactions, prices))
                .to.equal(10000);

            expect(overview.getFundValue(new Date('2016-10-01'), transactions, prices))
                .to.equal(110000);

            expect(overview.getFundValue(new Date('2016-12-01'), transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134));

            expect(overview.getFundValue(new Date('2017-01-31'), transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134));

            expect(overview.getFundValue(new Date('2017-04-30'), transactions, prices))
                .to.equal(95.3 * (89.095 + 894.134 - 883.229));

            expect(overview.getFundValue(new Date('2017-09-01'), transactions, prices))
                .to.equal(99.13 * (89.095 + 894.134 - 883.229));

            expect(overview.getFundValue(new Date('2017-10-01'), transactions, prices))
                .to.equal(12404);

        });
    });

    describe('queryFundPrices', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                query.response(common.testPricesQueryResponse);
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should run the correct query', async () => {
            const result = await overview.queryFundPrices(config, db, { uid: 1 });

            expect(result).to.deep.equal(common.testPricesQueryResponse);
        });
    });

    describe('processFundPrices', () => {
        it('should return a map of fund IDs to dated lists of prices', () => {
            const queryResult = common.testPricesQueryResponse;

            const result = overview.processFundPrices(queryResult);

            const expectedResult = Object.keys(testPricesProcessedResponse)
                .reduce((items, key) => ({
                    ...items,
                    [key]: testPricesProcessedResponse[key].map(({ date, ...item }) => ({
                        ...item,
                        date: DateTime.fromJSDate(date)
                            .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
                    }))
                }), {});

            expect(Object.keys(result).reduce((items, key) => ({
                ...items,
                [key]: result[key].map(({ date, ...row }) => ({
                    ...row,
                    date: date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
                }))
            }), {})).to.deep.equal(expectedResult);
        });
    });

    describe('queryFundTransactions', () => {
        before(() => {
            tracker.install();

            tracker.on('query', query => {
                query.response(common.testTransactionsQueryResponse);
            });
        });

        after(() => {
            tracker.uninstall();
        });

        it('should run the correct query', async () => {
            const result = await overview.queryFundTransactions(db, { uid: 1 });

            expect(result).to.deep.equal(common.testTransactionsQueryResponse);
        });
    });

    describe('processFundTransactions', () => {
        it('should return a valid map of IDs to lists of transactions', () => {
            const result = overview.processFundTransactions(common.testTransactionsQueryResponse);

            expect(Object.keys(result).reduce((items, key) => ({
                ...items,
                [key]: result[key].map(({ date, ...row }) => ({
                    ...row,
                    date: date.toISODate()
                }))
            }), {})).to.deep.equal({
                '3': [
                    { date: '2016-09-30', units: 1678.42, cost: 200000 },
                    { date: '2017-02-28', units: 846.38, cost: 100000 }
                ],
                '11': [
                    { date: '2016-08-31', units: 89.095, cost: 10000 },
                    { date: '2016-09-30', units: 894.134, cost: 100000 },
                    { date: '2017-04-30', units: -883.229, cost: -90000 }
                ]
            });
        });
    });

    describe('getMonthlyTotalFundValues', () => {
        it('should get the correct fund values', () => {
            const months = [
                DateTime.fromISO('2016-07-31'),
                DateTime.fromISO('2016-08-31'),
                DateTime.fromISO('2016-09-30'),
                DateTime.fromISO('2016-11-30'),
                DateTime.fromISO('2017-08-31'),
                DateTime.fromISO('2017-09-30'),
                DateTime.fromISO('2018-10-31')
            ];

            const old = [
                DateTime.fromISO('2016-04-30'),
                DateTime.fromISO('2016-05-31'),
                DateTime.fromISO('2016-06-30')
            ];

            const result = overview.getMonthlyTotalFundValues(
                months, old, testTransactionsProcessedResponse, testPricesProcessedResponse
            );

            const expectedResult = {
                funds: [0, 0, 0, 0, 10000, 310000, 310000, 309530, 151327, 137432],
                fundChanges: [1, 0, 0, 1, 1, 1, 1]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getMonthlyBalance', () => {
        it('should return valid data', () => {
            const queryResult = [
                { date: new Date('2014-04-30'), value: 478293 },
                { date: new Date('2014-06-30'), value: 500000 },
                { date: new Date('2014-11-30'), value: 600000 },
                { date: new Date('2014-12-31'), value: 605000 },
                { date: new Date('2015-01-31'), value: 1200000 },
                { date: new Date('2015-02-28'), value: 1150000 }
            ];

            const months = [
                DateTime.fromISO('2014-09-30'),
                DateTime.fromISO('2014-10-31'),
                DateTime.fromISO('2014-11-30'),
                DateTime.fromISO('2014-12-31'),
                DateTime.fromISO('2015-01-31'),
                DateTime.fromISO('2015-02-28'),
                DateTime.fromISO('2015-03-31'),
                DateTime.fromISO('2015-04-30')
            ];

            const result = overview.getMonthlyBalance(queryResult, months);

            const expectedResult = {
                balance: [0, 0, 600000, 605000, 1200000, 1150000, 0, 0],
                old: [478293, 0, 500000]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });
});

