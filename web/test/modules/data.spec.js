import test from 'ava';
import { DateTime } from 'luxon';
import {
    getPeriodMatch,
    uuid,
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
    randnBm,
    getValueForTransmit,
    getNullEditable,
    getAddDefaultValues,
    sortRowsByDate
} from '~client/modules/data';
import { dateInput } from '~client/modules/date';
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

test('uuid maping [0, 1] bijectively to a six-digit number', t => {
    t.is(uuid(0.6741, true), 109713);
    t.is(uuid(0.99123, true), 130497);
});

test('replaceAtIndex replaces an array item at a specified index', t => {
    t.deepEqual(replaceAtIndex([1, 5, 7, 3, 2], 1, 3.2), [1, 3.2, 7, 3, 2]);
});

test('replaceAtIndex doesn\'t modify the array if the index is -1', t => {
    const array = [1, 6, 9, 3, 10];

    t.is(replaceAtIndex(array, -1, 'foo'), array);
});

test('removeAtIndex removes an array item at a specified index', t => {
    t.deepEqual(removeAtIndex([1, 5, 7, 3, 2], 3), [1, 5, 7, 2]);
});

const transactionsData = [
    {
        date: '2017-05-08T23:00:00.000Z',
        units: 934,
        cost: 399924
    },
    {
        date: '2018-03-13T00:00:00.000Z',
        units: 25,
        cost: -10512
    },
    {
        date: '2018-06-06T23:00:00.000Z',
        units: -1239,
        cost: -539814
    },
    {
        date: '2018-04-25T23:00:00.000Z',
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

test('dataEquals compares YMDs', t => {
    t.is(dataEquals(dateInput('1/9/17'), dateInput('1/9/17')), true);
    t.is(dataEquals(dateInput('1/9/17'), dateInput('2/9/17')), false);
});
test('dataEquals compares transactions lists', t => {
    const testList1 = getTransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
    const testList2 = getTransactionsList([{ date: '2017-09-02', units: 1, cost: 1 }]);
    const testList3 = getTransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
    const testList4 = getTransactionsList([{ date: '2017-09-01', units: 1, cost: 1 }]);

    t.is(dataEquals(testList1, testList1), true);
    t.is(dataEquals(testList1, testList2), false);
    t.is(dataEquals(testList1, testList3), true);
    t.is(dataEquals(testList1, testList4), false);
    t.is(dataEquals(testList2, testList2), true);
    t.is(dataEquals(testList2, testList3), false);
    t.is(dataEquals(testList2, testList4), false);
    t.is(dataEquals(testList3, testList3), true);
    t.is(dataEquals(testList3, testList4), false);
});
test('dataEquals resorts to === by default', t => {
    t.is(dataEquals('foo', 'foo'), true);
    t.is(dataEquals('foo', 'bar'), false);
    t.is(dataEquals(0, -0), true);
    t.is(dataEquals(0.4, 0), false);
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

test('randnBm returning a Gaussian-incremented value from two random numbers', t => {
    t.is(randnBm(0.13, 0.87), 1.382792212427032);
    t.is(randnBm(0.83, 0.876), 0.43436275519719214);
});


test('getValueForTransmit returning numbers as-is', t => {
    t.is(getValueForTransmit(10), 10);
    t.is(getValueForTransmit(-35.3), -35.3);
});

test('getValueForTransmit returning serialised dates', t => {
    t.is(getValueForTransmit(dateInput('11/10/17')), '2017-10-11');
});

test('getValueForTransmit returns serialised transactions lists', t => {
    t.deepEqual(getValueForTransmit(getTransactionsList([{ date: '2017-10-11', units: 1, cost: 2 }])), [
        { date: '2017-10-11', cost: 2, units: 1 }
    ]);
});

test('getValueForTransmit returning objects as-is', t => {
    t.deepEqual(getValueForTransmit({ foo: 'bar' }), { foo: 'bar' });
});

test('getValueForTransmit stringifying the object, otherwise', t => {
    t.is(getValueForTransmit('23.51'), '23.51');
    t.is(getValueForTransmit('foobar'), 'foobar');
});

test('getNullEditable returning a list object for list pages', t => {
    t.deepEqual(getNullEditable('food'), {
        row: -1,
        col: -1,
        page: 'food',
        id: null,
        item: null,
        value: null,
        originalValue: null
    });
});

test('getNullEditable returning a normal object for non-list pages', t => {
    t.deepEqual(getNullEditable('overview'), {
        row: 0,
        col: -1,
        page: 'overview',
        id: null,
        item: null,
        value: null,
        originalValue: null
    });
});

test('getAddDefaultValues getting the right values for the food page', t => {
    const now = DateTime.local();

    t.deepEqual(getAddDefaultValues('food', now), [
        now,
        '',
        '',
        0,
        ''
    ]);
});

test('sortRowsByDate sorts rows by date', t => {
    const rows = [
        {
            id: '1',
            cols: [dateInput('11/10/17'), 'foo1', 'bar1', 3]
        },
        {
            id: '4',
            cols: [dateInput('10/10/17'), 'foo4', 'bar4', 1]
        },
        {
            id: '2',
            cols: [dateInput('11/10/17'), 'foo2', 'bar2', 5]
        },
        {
            id: '3',
            cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 13 }), 'foo3', 'bar3', 11]
        },
        {
            id: '5',
            cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 11 }), 'foo5', 'bar5', 13]
        }
    ];

    const sortedRows = sortRowsByDate(rows, 'food');

    t.deepEqual(
        sortedRows.map(item => ({
            ...item,
            cols: replaceAtIndex(item.cols, 0, item.cols[0].toISODate())
        })),
        [
            {
                id: '3',
                cols: [
                    '2017-10-12',
                    'foo3',
                    'bar3',
                    11
                ],
                firstPresent: false,
                future: false
            },
            {
                id: '5',
                cols: [
                    '2017-10-12',
                    'foo5',
                    'bar5',
                    13
                ],
                firstPresent: false,
                future: false
            },
            {
                id: '2',
                cols: [
                    '2017-10-11',
                    'foo2',
                    'bar2',
                    5
                ],
                firstPresent: false,
                future: false
            },
            {
                id: '1',
                cols: [
                    '2017-10-11',
                    'foo1',
                    'bar1',
                    3
                ],
                firstPresent: false,
                future: false
            },
            {
                id: '4',
                cols: [
                    '2017-10-10',
                    'foo4',
                    'bar4',
                    1
                ],
                firstPresent: false,
                future: false
            }
        ]
    );
});
