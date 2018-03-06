/**
 * data/overview API spec
 */

/* eslint max-lines: 0 */

const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;
const { prepareMockDb } = require('../../../test.common');
const moment = require('moment');

const common = require('../../../test.common');
const config = require('../../../../src/config')();
const overview = require('../../../../src/routes/data/cashflow/overview');

const { db, tracker } = prepareMockDb();

const TEST_DATE_FORMAT = 'YYYY-M-D';
const TEST_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

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
        { date: new Date('2016-09-19'), units: 1678.42, cost: 200000 },
        { date: new Date('2017-02-14'), units: 846.38, cost: 100000 }
    ],
    '11': [
        { date: new Date('2016-08-24'), units: 89.095, cost: 10000 },
        { date: new Date('2016-09-19'), units: 894.134, cost: 100000 },
        { date: new Date('2017-04-27'), units: -883.229, cost: -90000 }
    ]
};

describe('/api/data/overview', () => {
    describe('getStartTime', () => {
        it('should get the correct start time', () => {
            expect(overview.getStartTime({
                now: moment(new Date('2015-4-26')),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 5
            }).format(TEST_DATE_FORMAT)).to.equal('2014-11-26');
        });
        it('should handle spanning multiple years', () => {
            expect(overview.getStartTime({
                now: moment(new Date('2017-9-21')),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 15
            }).format(TEST_DATE_FORMAT)).to.equal('2016-6-21');
        });
        it('should handle configured limit', () => {
            expect(overview.getStartTime({
                now: moment(new Date('2014-11-01')),
                startYear: 2014,
                startMonth: 9,
                pastMonths: 5
            }).format(TEST_DATE_FORMAT)).to.equal('2014-10-1');
        });
    });

    describe('getMonths', () => {
        it('should return a list of dates corresponding to each month', () => {
            expect(overview.getMonths({
                now: moment(new Date('2015-06-13')),
                pastMonths: 5,
                futureMonths: 8,
                startYear: 2014,
                startMonth: 9
            }).map(date => date.format(TEST_DATE_FORMAT))).to.deep.equal([
                '2015-1-31',
                '2015-2-28',
                '2015-3-31',
                '2015-4-30',
                '2015-5-31',
                '2015-6-30',
                '2015-7-31',
                '2015-8-31',
                '2015-9-30',
                '2015-10-31',
                '2015-11-30',
                '2015-12-31',
                '2016-1-31',
                '2016-2-29'
            ]);
        });
    });

    describe('mapOldToYearMonths', () => {
        it('should work as expected', () => {
            const months = [
                moment(new Date('2016-02-29')),
                moment(new Date('2016-03-31')),
                moment(new Date('2016-04-30'))
            ];

            const old = new Array(5).fill(0);

            const expectedResult = [
                '2015-9-29',
                '2015-10-29',
                '2015-11-29',
                '2015-12-29',
                '2016-1-29'
            ];

            expect(overview.mapOldToYearMonths(months, old)
                .map(date => date.format(TEST_DATE_FORMAT))
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
                        date: moment(date).format(TEST_DATETIME_FORMAT)
                    }))
                }), {});

            expect(Object.keys(result).reduce((items, key) => ({
                ...items,
                [key]: result[key].map(({ date, ...row }) => ({
                    ...row,
                    date: date.format(TEST_DATETIME_FORMAT)
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
                    date: date.format(TEST_DATE_FORMAT)
                }))
            }), {})).to.deep.equal(Object.keys(testTransactionsProcessedResponse)
                .reduce((items, key) => ({
                    ...items,
                    [key]: testTransactionsProcessedResponse[key].map(({ date, ...row }) => ({
                        ...row,
                        date: moment(date).endOf('month')
                            .format(TEST_DATE_FORMAT)
                    }))
                }), {})
            );
        });
    });

    describe('getMonthlyTotalFundValues', () => {
        it('should get the correct fund values', () => {
            const months = [
                moment('2016-07-31'),
                moment('2016-08-31'),
                moment('2016-09-30'),
                moment('2016-11-30'),
                moment('2017-08-31'),
                moment('2017-09-30'),
                moment('2018-10-31')
            ];

            const old = [
                moment('2016-04-30'),
                moment('2016-05-31'),
                moment('2016-06-30')
            ];

            const result = overview.getMonthlyTotalFundValues(
                months, old, testTransactionsProcessedResponse, testPricesProcessedResponse
            );

            const expectedResult = [0, 0, 0, 0, 10000, 310000, 310000, 309530, 151327, 137432];

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
                moment('2014-09-30'),
                moment('2014-10-31'),
                moment('2014-11-30'),
                moment('2014-12-31'),
                moment('2015-01-31'),
                moment('2015-02-28'),
                moment('2015-03-31'),
                moment('2015-04-30')
            ];

            const result = overview.getMonthlyBalance(queryResult, months);

            const expectedResult = {
                balance: [0, 0, 600000, 605000, 1200000, 1150000, 0, 0],
                old: [478293, 0, 500000]
            };

            expect(result).to.deep.equal(expectedResult);
        });
    });

    describe('getTargets', () => {
        it('should get 1, 3 and 5 year savings predictions', () => {
            const balance = {
                old: [10, 5, 12, 15, 14, 20],
                balance: [21, 19, 25, 26, 30, 35, 37, 41, 0, 0, 0]
            };

            const futureMonths = 3;

            const expectedResult = [
                { tag: '1y', value: 85 },
                { tag: '3y', value: 173 },
                { tag: '5y', value: 221 }
            ];

            expect(overview.getTargets(balance, futureMonths)).to.deep.equal(expectedResult);
        });
    });
});

