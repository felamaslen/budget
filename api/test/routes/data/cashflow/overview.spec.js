import test from 'ava';
import { DateTime } from 'luxon';

import db from '~api/modules/db';
import config from '~api/config';

const {
    getStartTime,
    getMonths,
    processFundPrices,
    queryFundTransactions,
    processFundTransactions,
    getMonthlyBalance,
    getMonthlyTotalFundValues,
    getFundValue,
    mapOldToYearMonths,
    getData,
} = require('~api/routes/data/cashflow/overview');

const testPricesProcessedResponse = {
    1: [
        { date: new Date('2017-09-01 00:00:00.000'), value: 95.49 },
        { date: new Date('2017-08-01 00:00:00.000'), value: 121 },
    ],
    3: [
        { date: new Date('2017-09-01 00:00:00.000'), value: 49.52 },
        { date: new Date('2017-08-01 00:00:00.000'), value: 56.01 },
    ],
    11: [
        { date: new Date('2017-09-01 00:00:00.000'), value: 124.04 },
        { date: new Date('2017-08-01 00:00:00.000'), value: 99.13 },
        { date: new Date('2016-11-01 00:00:00.000'), value: 95.3 },
    ],
};

const testTransactionsProcessedResponse = {
    3: [
        { date: DateTime.fromJSDate(new Date('2016-09-19')), units: 1678.42, cost: 200000 },
        { date: DateTime.fromJSDate(new Date('2017-02-14')), units: 846.38, cost: 100000 },
    ],
    11: [
        { date: DateTime.fromJSDate(new Date('2016-08-24')), units: 89.095, cost: 10000 },
        { date: DateTime.fromJSDate(new Date('2016-09-19')), units: 894.134, cost: 100000 },
        { date: DateTime.fromJSDate(new Date('2017-04-27')), units: -883.229, cost: -90000 },
    ],
};

test('getStartTime gets the correct start time', (t) => {
    t.is(getStartTime({
        now: DateTime.fromISO('2015-04-26'),
        startYear: 2014,
        startMonth: 9,
        pastMonths: 5,
    }).toISODate(), '2014-11-26');
});

test('handles spanning multiple years', (t) => {
    t.is(getStartTime({
        now: DateTime.fromISO('2017-09-21'),
        startYear: 2014,
        startMonth: 9,
        pastMonths: 15,
    }).toISODate(), '2016-06-21');
});

test('handles configured limit', (t) => {
    t.is(getStartTime({
        now: DateTime.fromISO('2014-11-01'),
        startYear: 2014,
        startMonth: 9,
        pastMonths: 5,
    }).toISODate(), '2014-10-01');
});

test('getMonths returns a list of dates corresponding to each month', (t) => {
    t.deepEqual(getMonths({
        now: DateTime.fromISO('2015-06-13'),
        pastMonths: 5,
        futureMonths: 8,
        startYear: 2014,
        startMonth: 9,
    }).map((date) => date.toISODate()), [
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
        '2016-02-29',
    ]);
});

test('mapOldToYearMonths works as expected', (t) => {
    const months = [
        DateTime.fromISO('2016-02-29'),
        DateTime.fromISO('2016-03-31'),
        DateTime.fromISO('2016-04-30'),
    ];

    const old = new Array(5).fill(0);

    const expectedResult = [
        '2015-09-29',
        '2015-10-29',
        '2015-11-29',
        '2015-12-29',
        '2016-01-29',
    ];

    t.deepEqual(
        mapOldToYearMonths(months, old).map((date) => date.toISODate()),
        expectedResult,
    );
});

test('getFundValue gets the correct fund price at a specified date', (t) => {
    const transactions = testTransactionsProcessedResponse['11'];
    const prices = testPricesProcessedResponse['11'];

    t.is(getFundValue(new Date('2016-07-31'), transactions, prices), 0);

    t.is(getFundValue(new Date('2016-08-31'), transactions, prices), 10000);

    t.is(getFundValue(new Date('2016-10-31'), transactions, prices), 110000);

    t.is(getFundValue(new Date('2016-12-31'), transactions, prices), 95.3 * (89.095 + 894.134));

    t.is(getFundValue(new Date('2017-01-31'), transactions, prices), 95.3 * (89.095 + 894.134));

    t.is(getFundValue(new Date('2017-04-30'), transactions, prices), 95.3 * (89.095 + 894.134 - 883.229));

    t.is(getFundValue(new Date('2017-09-30'), transactions, prices), 124.04 * (89.095 + 894.134 - 883.229));

    t.is(getFundValue(new Date('2017-10-31'), transactions, prices), 12404);
});

test('processFundPrices returns a map of fund IDs to dated lists of prices', (t) => {
    const queryResult = [
        { time: new Date('2017-09-30 17:01:01'), ids: ['11', '1', '3'], prices: [124.04, 95.49, 49.52] },
        { time: new Date('2017-09-01 17:01:01'), ids: ['11', '1', '3'], prices: [100, 123, 50.97] },
        { time: new Date('2017-08-31 17:01:02'), ids: ['1', '11', '3'], prices: [121, 99.13, 56.01] },
        { time: new Date('2016-11-07 06:26:40'), ids: ['11'], prices: [95.3] },
    ];

    const result = processFundPrices(queryResult);

    const expectedResult = Object.keys(testPricesProcessedResponse)
        .reduce((items, key) => ({
            ...items,
            [key]: testPricesProcessedResponse[key].map(({ date, ...item }) => ({
                ...item,
                date: DateTime.fromJSDate(date)
                    .toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
            })),
        }), {});

    t.deepEqual(Object.keys(result).reduce((items, key) => ({
        ...items,
        [key]: result[key].map(({ date, ...row }) => ({
            ...row,
            date: date.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
        })),
    }), {}), expectedResult);
});

test('queryFundTransactions runs the correct query', async (t) => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const result = await queryFundTransactions(db, { uid });

    const [{ id: fundId3 }] = await db.select('id')
        .from('funds')
        .where('item', '=', 'fund3');
    const [{ id: fundId1 }] = await db.select('id')
        .from('funds')
        .where('item', '=', 'fund1');

    t.deepEqual(result, [
        {
            id: fundId3, date: new Date('2016-09-19'), units: 1678.42, cost: 200000,
        },
        {
            id: fundId3, date: new Date('2017-02-14'), units: 846.38, cost: 100000,
        },
        {
            id: fundId1, date: new Date('2016-08-24'), units: 89.095, cost: 100000,
        },
        {
            id: fundId1, date: new Date('2016-09-19'), units: 894.134, cost: 100000,
        },
        {
            id: fundId1, date: new Date('2017-04-27'), units: -883.229, cost: -90000,
        },
    ]);
});

test('processFundTransactions returns a valid map of IDs to lists of transactions', async (t) => {
    const [{ id: fundId3 }] = await db.select('id')
        .from('funds')
        .where('item', '=', 'fund3');
    const [{ id: fundId1 }] = await db.select('id')
        .from('funds')
        .where('item', '=', 'fund1');

    const result = processFundTransactions([
        {
            id: fundId3, date: new Date('2016-09-19'), units: 1678.42, cost: 200000,
        },
        {
            id: fundId3, date: new Date('2017-02-14'), units: 846.38, cost: 100000,
        },
        {
            id: fundId1, date: new Date('2016-08-24'), units: 89.095, cost: 10000,
        },
        {
            id: fundId1, date: new Date('2016-09-19'), units: 894.134, cost: 100000,
        },
        {
            id: fundId1, date: new Date('2017-04-27'), units: -883.229, cost: -90000,
        },
    ]);

    t.deepEqual(Object.keys(result).reduce((items, key) => ({
        ...items,
        [key]: result[key].map(({ date, ...row }) => ({
            ...row,
            date: date.toISODate(),
        })),
    }), {}), {
        [fundId3]: [
            { date: '2016-09-01', units: 1678.42, cost: 200000 },
            { date: '2017-02-01', units: 846.38, cost: 100000 },
        ],
        [fundId1]: [
            { date: '2016-08-01', units: 89.095, cost: 10000 },
            { date: '2016-09-01', units: 894.134, cost: 100000 },
            { date: '2017-04-01', units: -883.229, cost: -90000 },
        ],
    });
});

test('getMonthlyTotalFundValue gets the correct fund values', (t) => {
    const months = [
        DateTime.fromISO('2016-07-31'),
        DateTime.fromISO('2016-08-31'),
        DateTime.fromISO('2016-09-30'),
        DateTime.fromISO('2016-11-30'),
        DateTime.fromISO('2017-08-31'),
        DateTime.fromISO('2017-09-30'),
        DateTime.fromISO('2018-10-31'),
    ];

    const old = [
        DateTime.fromISO('2016-04-30'),
        DateTime.fromISO('2016-05-31'),
        DateTime.fromISO('2016-06-30'),
    ];

    const result = getMonthlyTotalFundValues(
        months, old, testTransactionsProcessedResponse, testPricesProcessedResponse,
    );

    const expectedResult = {
        funds: [0, 0, 0, 0, 10000, 310000, 293702, 151327, 137432, 137432],
    };

    t.deepEqual(result, expectedResult);
});

test('getMonthlyBalance returns valid data', (t) => {
    const queryResult = [
        { date: new Date('2014-04-30'), value: 478293 },
        { date: new Date('2014-06-30'), value: 500000 },
        { date: new Date('2014-11-30'), value: 600000 },
        { date: new Date('2014-12-31'), value: 605000 },
        { date: new Date('2015-01-31'), value: 1200000 },
        { date: new Date('2015-02-28'), value: 1150000 },
    ];

    const months = [
        DateTime.fromISO('2014-09-30'),
        DateTime.fromISO('2014-10-31'),
        DateTime.fromISO('2014-11-30'),
        DateTime.fromISO('2014-12-31'),
        DateTime.fromISO('2015-01-31'),
        DateTime.fromISO('2015-02-28'),
        DateTime.fromISO('2015-03-31'),
        DateTime.fromISO('2015-04-30'),
    ];

    const result = getMonthlyBalance(queryResult, months);

    const expectedResult = {
        balance: [0, 0, 600000, 605000, 1200000, 1150000, 0, 0],
        old: [478293, 0, 500000],
    };

    t.deepEqual(result, expectedResult);
});

// eslint-disable-next-line max-statements
test('getData gets overview data', async (t) => {
    const [{ uid }] = await db.select('uid')
        .from('users')
        .where('name', '=', 'test-user');

    const user = { uid };

    const result = await getData(config, db, user);

    const now = DateTime.local().setZone(config.timeZone);
    const { year, month } = now;

    const { numLast, numFuture } = config.data.overview;

    t.is(Object.keys(result).length, 6);

    t.deepEqual(result.startYearMonth, [
        year + Math.floor((month - numLast) / 12),
        (((month - numLast + 12) % 12) + 12) % 12,
    ]);

    t.deepEqual(result.endYearMonth, [
        year + Math.floor((month + numFuture) / 12),
        (((month + numFuture + 12) % 12) + 12) % 12,
    ]);

    t.is(result.currentYear, year);
    t.is(result.currentMonth, month);

    t.is(result.futureMonths, numFuture);

    t.is(Object.keys(result.cost).length, 9);

    t.is(result.cost.balance.length, numLast + numFuture + 1);
    t.true(result.cost.balance.every((value) => typeof value === 'number'));

    t.true(result.cost.old.every((value) => typeof value === 'number'));

    t.is(result.cost.income.length, numLast + numFuture + 1);
    t.true(result.cost.income.every((value) => typeof value === 'number'));

    t.is(result.cost.funds.length, numLast + numFuture + 1 + result.cost.old.length);
    t.true(result.cost.funds.every((value) => typeof value === 'number'));

    t.is(result.cost.bills.length, numLast + numFuture + 1);
    t.true(result.cost.bills.every((value) => typeof value === 'number'));

    t.is(result.cost.food.length, numLast + numFuture + 1);
    t.true(result.cost.food.every((value) => typeof value === 'number'));

    t.is(result.cost.general.length, numLast + numFuture + 1);
    t.true(result.cost.general.every((value) => typeof value === 'number'));

    t.is(result.cost.holiday.length, numLast + numFuture + 1);
    t.true(result.cost.holiday.every((value) => typeof value === 'number'));

    t.is(result.cost.social.length, numLast + numFuture + 1);
    t.true(result.cost.social.every((value) => typeof value === 'number'));
});
