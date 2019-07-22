/* eslint-disable max-lines */
import test from 'ava';
import sinon from 'sinon';
import { DateTime } from 'luxon';
import shortid from 'shortid';

import {
    getPeriodMatch,
    replaceAtIndex,
    removeAtIndex,
    getTransactionsList,
    formatTransactionsList,
    addToTransactionsList,
    modifyTransaction,
    modifyTransactionById,
    getTotalUnits,
    getTotalCost,
    isSold,
    dataEquals,
    arrayAverage,
    limitTimeSeriesLength,
    randnBm,
    getValueFromTransmit,
    getValueForTransmit
} from '~client/modules/data';
import { AVERAGE_MEDIAN, AVERAGE_EXP } from '~client/constants';

let envBefore = null;

test.before(() => {
    envBefore = process.env.DEFAULT_FUND_PERIOD;

    process.env.DEFAULT_FUND_PERIOD = 'year11';
});

test.after(() => {
    process.env.DEFAULT_FUND_PERIOD = envBefore;
});

test('getPeriodMatch returning env variable by default', t => {
    t.deepEqual(getPeriodMatch('foo'), { period: 'year', length: '11' });

    process.env.DEFAULT_FUND_PERIOD = 'year11';
});

test('getPeriodMatch spliting up a short period representation', t => {
    t.deepEqual(getPeriodMatch('month5'), { period: 'month', length: '5' });
    t.deepEqual(getPeriodMatch('year10'), { period: 'year', length: '10' });
});

test('replaceAtIndex replaces an array item at a specified index', t => {
    t.deepEqual(replaceAtIndex([1, 5, 7, 3, 2], 1, 3.2), [1, 3.2, 7, 3, 2]);
});

test('replaceAtIndex doesn\'t modify the array if the index is -1', t => {
    const array = [1, 6, 9, 3, 10];

    t.is(replaceAtIndex(array, -1, 'foo'), array);
});

test('replaceAtIndex accepts a parameter to replace with a function of the previous value', t => {
    t.deepEqual(replaceAtIndex([1, 5, 7, 3, 2], 1, value => value ** 2, true),
        [1, 25, 7, 3, 2]);
});

test('removeAtIndex removes an array item at a specified index', t => {
    t.deepEqual(removeAtIndex([1, 5, 7, 3, 2], 3), [1, 5, 7, 2]);
});

const transactionsData = [
    {
        date: '2017-05-09T00:00:00.000Z',
        units: 934,
        cost: 399924
    },
    {
        date: '2018-03-13T00:00:00.000Z',
        units: 25,
        cost: -10512
    },
    {
        date: '2018-06-07T00:00:00.000Z',
        units: -1239,
        cost: -539814
    },
    {
        date: '2018-04-26T00:00:00.000Z',
        units: 280,
        cost: 119931
    }
];

test('getTransactionsList makes a list from API response data', t => {
    const transactionsList = getTransactionsList(transactionsData);

    t.true(Array.isArray(transactionsList));
    t.is(transactionsList.length, transactionsData.length);
});

test('getTransactionsList adds fake IDs to each item', t => {
    const transactionsList = getTransactionsList(transactionsData);
    t.true(transactionsList.every(item => typeof item.id === 'string' && item.id.length >= 7));
});

test('getTransactionsList handles rounding errors', t => {
    // this example is a real world example which presented rounding errors
    const listWithErrors = getTransactionsList([
        {
            date: '2016-09-19T05:00Z',
            units: 1678.42,
            cost: 2000
        },
        {
            date: '2017-02-14T05:00Z',
            units: 846.38,
            cost: 1000
        },
        {
            date: '2017-10-25T05:00Z',
            units: 817,
            cost: 1000
        },
        {
            date: '2018-03-14T05:00Z',
            units: 1217.43,
            cost: 1500
        },
        {
            date: '2018-09-24T05:00Z',
            units: -4559.23,
            cost: -5595.2
        }
    ]);

    t.is(getTotalUnits(listWithErrors), 0);

    t.true(isSold(listWithErrors));
});

test('formatTransactionsList returns the array without IDs, ordered by date', t => {
    const transactionsList = getTransactionsList(transactionsData);
    const transactionsListFormatted = formatTransactionsList(transactionsList);

    t.deepEqual(transactionsListFormatted, [
        {
            date: '2017-05-09',
            units: 934,
            cost: 399924
        },
        {
            date: '2018-03-13',
            units: 25,
            cost: -10512
        },
        {
            date: '2018-04-26',
            units: 280,
            cost: 119931
        },
        {
            date: '2018-06-07',
            units: -1239,
            cost: -539814
        }
    ]);
});

test('addToTransactionsList adds a list item from API-like data', t => {
    const transactionsList = getTransactionsList(transactionsData);

    const transactionsListAdded = addToTransactionsList(transactionsList, {
        date: '2018-09-13T03:20Z',
        units: 20,
        cost: 3
    });

    t.is(transactionsListAdded.length, 5);
    t.true(transactionsListAdded.every(item => typeof item.id === 'string' && item.id.length >= 7));
});

test('modifyTransaction modifies a transaction list at a specified index', t => {
    const transactionsList = getTransactionsList(transactionsData);

    const modifiedDate = modifyTransaction(transactionsList, 1, { date: '2018-03-14T00:00:00.000Z' });

    t.is(modifiedDate[1].date.day, 14);

    const modifiedUnits = modifyTransaction(transactionsList, 3, { units: 281 });

    t.is(modifiedUnits[3].units, 281);

    const modifiedCost = modifyTransaction(transactionsList, 2, { cost: -100 });

    t.is(modifiedCost[2].cost, -100);

    // check that the original list wasn't mutated
    t.is(transactionsList[1].date.day, 13);
    t.is(transactionsList[3].units, 280);
    t.is(transactionsList[2].cost, -539814);
});

test('modifyTransactionById modifies a transaction list at a specified id', t => {
    const transactionsList = getTransactionsList(transactionsData);

    const id1 = transactionsList[1].id;
    const id2 = transactionsList[2].id;
    const id3 = transactionsList[3].id;

    const modifiedDate = modifyTransactionById(transactionsList, id1, { date: '2018-03-14T00:00:00.000Z' });

    t.is(modifiedDate[1].date.day, 14);

    const modifiedUnits = modifyTransactionById(transactionsList, id3, { units: 281 });

    t.is(modifiedUnits[3].units, 281);

    const modifiedCost = modifyTransactionById(transactionsList, id2, { cost: -100 });

    t.is(modifiedCost[2].cost, -100);

    // check that the original list wasn't mutated
    t.is(transactionsList[1].date.day, 13);
    t.is(transactionsList[3].units, 280);
    t.is(transactionsList[2].cost, -539814);
});

test('getTotalUnits gets the sum of units in a transactions list', t => {
    const transactionsList = getTransactionsList(transactionsData);

    t.is(getTotalUnits(transactionsList), 0);

    t.is(getTotalUnits(removeAtIndex(transactionsList, 2)), 1239);
});

test('getTotalCost gets the sum of cost in a transactions list', t => {
    const transactionsList = getTransactionsList(transactionsData);

    t.is(getTotalCost(transactionsList), -30471);
});

test('getSold determines if a transactions list represents a holding which is fully sold', t => {
    const transactionsList = getTransactionsList(transactionsData);

    t.true(isSold(transactionsList));
    t.false(isSold(modifyTransaction(transactionsList, 3, { units: -1238 })));
});

test('arrayAverage gets the median of a list of data', t => {
    t.is(arrayAverage([1, 2, 5, 10, 10, 11, 9, 3, 20], AVERAGE_MEDIAN), 9);

    t.is(arrayAverage([1, 5, 10, 10, 11, 9, 3, 20], AVERAGE_MEDIAN), 9.5);
});
test('arrayAverage gets an exponential average for a list of data', t => {
    const theList = [1, 2, 5, 10, 10, 11, 9, 3, 20];

    const averageExp = 13.105675146771038;

    t.is(arrayAverage(theList, AVERAGE_EXP), averageExp);
});
test('arrayAverage gets the mean by default', t => {
    t.is(arrayAverage([1, 2, 5, 10, 10, 11, 9, 3, 20]), 71 / 9);

    t.is(arrayAverage([1, 5, 10, 10, 11, 9, 3, 20]), 8.625);
});
test('arrayAverage does not mutate the array', t => {
    const values = [1, 7, 3, 9];

    arrayAverage(values, AVERAGE_MEDIAN);

    t.deepEqual(values, [1, 7, 3, 9]);
});

test('limitTimeSeriesLength filters time series according to a least-distance algorithm', t => {
    const series = [
        [1, 10110],
        [1.9, 19092],
        [3, 99123],
        [4.2, 82782],
        [5.8, 11823],
        [6.9, 88123],
        [8.1, 12939],
        [9, 99123],
        [10.1, 91723],
        [11.5, 91231]
    ];

    const result = limitTimeSeriesLength(series, 3);

    t.deepEqual(result, [
        [4.2, 82782],
        [6.9, 88123],
        [11.5, 91231]
    ]);

    const resultLong = limitTimeSeriesLength(series, 6);

    t.deepEqual(resultLong, [
        [3, 99123],
        [4.2, 82782],
        [5.8, 11823],
        [6.9, 88123],
        [10.1, 91723],
        [11.5, 91231]
    ]);
});

test('randnBm returns a Gaussian-incremented value from two random numbers', t => {
    let randomIndex = 0;
    const testRandoms = [0.36123, 0.96951];
    const stub = sinon.stub(Math, 'random').callsFake(() => testRandoms[(randomIndex++) % 2]);

    t.is(randnBm(), Math.sqrt(-2 * Math.log(0.36123)) * Math.cos(2 * Math.PI * 0.96951));

    stub.restore();
});

test('getValueFromTransmit returns "date" as DateTime', t => {
    t.deepEqual(getValueFromTransmit('date', '2019-06-05'), DateTime.fromISO('2019-06-05'));
});

test('getValueFromTransmit returns "item" as-is', t => {
    t.deepEqual(getValueFromTransmit('item', 'some-item'), 'some-item');
});

test('getValueFromTransmit returns "category" as-is', t => {
    t.deepEqual(getValueFromTransmit('category', 'some-category'), 'some-category');
});

test('getValueFromTransmit returns "holiday" as-is', t => {
    t.deepEqual(getValueFromTransmit('holiday', 'some-holiday'), 'some-holiday');
});

test('getValueFromTransmit returns "social" as-is', t => {
    t.deepEqual(getValueFromTransmit('social', 'some-social'), 'some-social');
});

test('getValueFromTransmit returns "shop" as-is', t => {
    t.deepEqual(getValueFromTransmit('shop', 'some-shop'), 'some-shop');
});

test('getValueFromTransmit returns "cost" as an integer', t => {
    t.deepEqual(getValueFromTransmit('cost', 123), 123);
    t.deepEqual(getValueFromTransmit('cost', 123.45), 123);
    t.deepEqual(getValueFromTransmit('cost', '123.45'), 123);
    t.deepEqual(getValueFromTransmit('cost', 'not a number'), 0);
});

test('getValueFromTransmit returns "transactions" as a transactions list', t => {
    const stub = sinon.stub(shortid, 'generate').returns('something');

    const transactions = [{ date: '2017-09-01', units: 2.5, cost: 1 }];

    t.deepEqual(getValueFromTransmit('transactions', transactions), getTransactionsList(transactions));

    stub.restore();
});

test('getValueForTransmit returns date as ISO date', t => {
    t.deepEqual(getValueForTransmit('date', DateTime.fromISO('2019-06-05')), '2019-06-05');
});

test('getValueForTransmit returns "item" as-is', t => {
    t.deepEqual(getValueForTransmit('item', 'some-item'), 'some-item');
});

test('getValueForTransmit returns "category" as-is', t => {
    t.deepEqual(getValueForTransmit('category', 'some-category'), 'some-category');
});

test('getValueForTransmit returns "holiday" as-is', t => {
    t.deepEqual(getValueForTransmit('holiday', 'some-holiday'), 'some-holiday');
});

test('getValueForTransmit returns "social" as-is', t => {
    t.deepEqual(getValueForTransmit('social', 'some-social'), 'some-social');
});

test('getValueForTransmit returns "shop" as-is', t => {
    t.deepEqual(getValueForTransmit('shop', 'some-shop'), 'some-shop');
});

test('getValueForTransmit returns cost as an integer', t => {
    t.deepEqual(getValueForTransmit('cost', 123), 123);
    t.deepEqual(getValueForTransmit('cost', 123.45), 123);
    t.deepEqual(getValueForTransmit('cost', '123.45'), 123);
    t.deepEqual(getValueForTransmit('cost', 'not a number'), 0);
});

test('getValueForTransmit returns transactions as a simple array', t => {
    const transactions = [{ date: '2017-09-01', units: 2.5, cost: 1 }];

    t.deepEqual(getValueForTransmit('transactions', getTransactionsList(transactions)), transactions);
});
