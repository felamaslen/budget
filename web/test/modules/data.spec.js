import test from 'ava';
import { fromJS, List as list } from 'immutable';
import { DateTime } from 'luxon';
import {
    getPeriodMatch,
    uuid,
    TransactionsList,
    dataEquals,
    listAverage,
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

const transactionsShortList = new TransactionsList(transactionsData, true);

const transactionsLongList = new TransactionsList(transactionsShortList.list, false);

const transactionsLists = [
    transactionsShortList,
    transactionsLongList
];

test('TransactionsList returning a list as valueOf()', t => {
    transactionsLists.forEach(transactions => {
        const value = transactions.valueOf();

        t.true(value instanceof list);
        t.is(value.size, 4);
    });
});

test('TransactionsList returning a raw array from format(), ordered by date', t => {
    transactionsLists.forEach(transactions => {
        t.deepEqual(transactions.format(), [
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
});

test('TransactionsList method to remove items by their index', t => {
    transactionsLists.forEach(transactions => {
        const removed = transactions.remove(0);

        t.true(removed instanceof TransactionsList);
        t.is(removed.size, 3);
    });
});

test('TransactionsList method to push an item', t => {
    transactionsLists.forEach(transactions => {
        const pushed = transactions.push({
            date: '2018-09-13T03:20Z',
            units: 20,
            cost: 3
        });

        t.true(pushed instanceof TransactionsList);
        t.is(pushed.size, 5);
    });
});

test('TransactionsList method to get the total units', t => {
    transactionsLists.forEach(transactions => {
        t.is(transactions.getTotalUnits(), 0);

        t.is(transactions.remove(3).getTotalUnits(), 1239);
    });
});

test('TransactionsList method to get the total cost', t => {
    transactionsLists.forEach(transactions => {
        t.is(transactions.getTotalCost(), -30471);
    });
});

test('TransactionsList method to determine if the holding is sold', t => {
    transactionsLists.forEach(transactions => {
        t.is(transactions.isSold(), true);

        t.is(transactions.setIn([3, 'units'], -1238).isSold(), false);
    });
});

test('TransactionsList handling rounding errors', t => {
    const listWithErrors = new TransactionsList([
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

    t.is(listWithErrors.getTotalUnits(), 0);

    t.is(listWithErrors.isSold(), true);
});

test('dataEquals compareing YMDs', t => {
    t.is(dataEquals(dateInput('1/9/17'), dateInput('1/9/17')), true);
    t.is(dataEquals(dateInput('1/9/17'), dateInput('2/9/17')), false);
});
test('dataEquals compareing TransactionsLists', t => {
    const testList1 = new TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
    const testList2 = new TransactionsList([{ date: '2017-09-02', units: 1, cost: 1 }]);
    const testList3 = new TransactionsList([{ date: '2017-09-01', units: 2.5, cost: 1 }]);
    const testList4 = new TransactionsList([{ date: '2017-09-01', units: 1, cost: 1 }]);

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
test('dataEquals resorting to === by default', t => {
    t.is(dataEquals('foo', 'foo'), true);
    t.is(dataEquals('foo', 'bar'), false);
    t.is(dataEquals(0, -0), true);
    t.is(dataEquals(0.4, 0), false);
});


test('listAverage getting the median of a list of data', t => {
    t.is(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN), 9);

    t.is(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20]), AVERAGE_MEDIAN), 9.5);
});
test('listAverage getting an exponential average for a list of data', t => {
    const theList = list([1, 2, 5, 10, 10, 11, 9, 3, 20]);

    const averageExp = 13.105675146771038;

    t.is(listAverage(theList, AVERAGE_EXP), averageExp);
});
test('listAverage getting the mean by default', t => {
    t.is(listAverage(list([1, 2, 5, 10, 10, 11, 9, 3, 20])), 71 / 9);

    t.is(listAverage(list([1, 5, 10, 10, 11, 9, 3, 20])), 8.625);
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

test('getValueForTransmit returning serialised transactions lists', t => {
    t.deepEqual(getValueForTransmit(new TransactionsList([{ date: '2017-10-11', units: 1, cost: 2 }])), [
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
    t.deepEqual(getNullEditable('food').toJS(), {
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
    t.deepEqual(getNullEditable('overview').toJS(), {
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

    t.deepEqual(getAddDefaultValues('food', now).toJS(), [
        now,
        '',
        '',
        0,
        ''
    ]);
});

test('sortRowsByDate sorting rows by date', t => {
    const rows = fromJS({
        1: {
            cols: [dateInput('11/10/17'), 'foo1', 'bar1', 3]
        },
        4: {
            cols: [dateInput('10/10/17'), 'foo4', 'bar4', 1]
        },
        2: {
            cols: [dateInput('11/10/17'), 'foo2', 'bar2', 5]
        },
        3: {
            cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 13 }), 'foo3', 'bar3', 11]
        },
        5: {
            cols: [DateTime.fromObject({ year: 2017, month: 10, day: 12, hour: 11 }), 'foo5', 'bar5', 13]
        }
    });

    const sortedRows = sortRowsByDate(rows, 'food');

    t.deepEqual(
        sortedRows.map(item => item
            .setIn(['cols', 0], item.getIn(['cols', 0]).toISODate())
        )
            .toJS(),
        {
            3: {
                cols: [
                    '2017-10-12',
                    'foo3',
                    'bar3',
                    11
                ],
                'first-present': false,
                future: false
            },
            5: {
                cols: [
                    '2017-10-12',
                    'foo5',
                    'bar5',
                    13
                ],
                'first-present': false,
                future: false
            },
            2: {
                cols: [
                    '2017-10-11',
                    'foo2',
                    'bar2',
                    5
                ],
                'first-present': false,
                future: false
            },
            1: {
                cols: [
                    '2017-10-11',
                    'foo1',
                    'bar1',
                    3
                ],
                'first-present': false,
                future: false
            },
            4: {
                cols: [
                    '2017-10-10',
                    'foo4',
                    'bar4',
                    1
                ],
                'first-present': false,
                future: false
            }
        }
    );
});
