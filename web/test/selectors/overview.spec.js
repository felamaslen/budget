import test from 'ava';
import sinon from 'sinon';
import { DateTime } from 'luxon';

import { testState as state } from '~client-test/test_data/state';
import {
    getStartDate,
    getEndDate,
    getNumRows,
    getBalance,
    getFutureMonths,
    getProcessedCost,
    getRowDates,
    getOverviewTable
} from '~client/selectors/overview';

import { getCurrentDate } from '~client/selectors/now';

const testRandoms = [0.36123, 0.72246];

const getRandomStub = () => {
    let randomIndex = 0;

    return sinon.stub(Math, 'random').callsFake(() => testRandoms[(randomIndex++) % 2]);
};

test('getStartDate gets the start date', t => {
    t.deepEqual(getStartDate(state), DateTime.fromISO('2018-01-31T23:59:59.999Z'));
});

test('getEndDate gets the end date', t => {
    t.deepEqual(getEndDate(state), DateTime.fromISO('2018-06-30T23:59:59.999Z'));
});

test('getNumRows gets the numRows', t => {
    t.is(getNumRows(state), 7);
});

test('getBalance gets the balance items', t => {
    t.deepEqual(getBalance(state), [13502, 19220, 11876, 14981, 14230, 12678, 0]);
});

test('getCurrentDate does not reload the result if the day doesn\'t change', t => {
    const result = getCurrentDate(state);

    const nextResult = getCurrentDate({ ...state, now: DateTime.fromISO('2018-03-23T12:32:02Z') });

    // notice this equality check is shallow, i.e. by reference, so if the date had
    // been recalculated, this test would fail :)
    t.is(nextResult, result);
});

test('getFutureMonths calculates the number of months in the future there are, based on the current date', t => {
    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-23T11:45:20Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-31T15:20Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-03-31T22:59Z') }), 3);

    t.is(getFutureMonths({ ...state, now: DateTime.fromISO('2018-04-01T00:00Z') }), 2);
});

test('getRowDates gets a list of dates at the end of each month', t => {
    t.deepEqual(getRowDates(state), [
        DateTime.fromISO('2018-01-31T23:59:59.999Z'),
        DateTime.fromISO('2018-02-28T23:59:59.999Z'),
        DateTime.fromISO('2018-03-31T23:59:59.999Z'),
        DateTime.fromISO('2018-04-30T23:59:59.999Z'),
        DateTime.fromISO('2018-05-31T23:59:59.999Z'),
        DateTime.fromISO('2018-06-30T23:59:59.999Z'),
        DateTime.fromISO('2018-07-31T23:59:59.999Z')
    ]);
});

test('getProcessedCost processs the cost data, including making predictions, adding spending / net columns etc.', t => {
    const stub = getRandomStub();

    t.deepEqual(getProcessedCost(state), {
        spending: [1260, 2068, 659, 754, 207, 207, 207],
        predicted: [13502, 13334, 20062, 13622, 15715, 17309, 19703],
        balanceWithPredicted: [13502, 19220, 11876, 14981, 15715, 17309, 19703],
        old: [10000, 11500, 11200],
        net: [740, -168, 841, 1746, 2093, 1593, 2393],
        fundsOld: [94, 105, 110],
        funds: [100, 101, 102, 103, 104, 105, 106],
        fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
        income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
        bills: [1000, 900, 400, 650, 0, 0, 0],
        food: [50, 13, 20, 26, 23, 23, 23],
        general: [150, 90, 10, 47, 69, 69, 69],
        social: [50, 65, 134, 13, 58, 58, 58],
        holiday: [10, 1000, 95, 18, 57, 57, 57]
    });

    stub.restore();
});

test('getOverviewTable gets a list of rows for the overview table', t => {
    const stub = getRandomStub();

    t.deepEqual(getOverviewTable(state), [
        {
            key: 'Jan-18',
            past: true,
            active: false,
            future: false,
            cells: [
                { column: ['month', 'Month'], value: 'Jan-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 100, rgb: [172, 185, 190] },
                { column: ['bills', 'Bills'], value: 1000, rgb: [183, 28, 28] },
                { column: ['food', 'Food'], value: 50, rgb: [67, 160, 71] },
                { column: ['general', 'General'], value: 150, rgb: [1, 87, 155] },
                { column: ['holiday', 'Holiday'], value: 10, rgb: [233, 245, 243] },
                { column: ['social', 'Social'], value: 50, rgb: [227, 213, 161] },
                { column: ['income', 'Income'], value: 2000, rgb: [146, 223, 155] },
                { column: ['spending', 'Out'], value: 1260, rgb: [209, 99, 99] },
                { column: ['net', 'Net'], value: 740, rgb: [206, 241, 211] },
                { column: ['predicted', 'Predicted'], value: 13502, rgb: [161, 228, 169] },
                { column: ['balance', 'Net Worth'], value: 13502, rgb: [146, 223, 155] }
            ]
        },
        {
            key: 'Feb-18',
            past: true,
            active: false,
            future: false,
            cells: [
                { column: ['month', 'Month'], value: 'Feb-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 101, rgb: [171, 184, 190] },
                { column: ['bills', 'Bills'], value: 900, rgb: [189, 47, 47] },
                { column: ['food', 'Food'], value: 13, rgb: [202, 228, 203] },
                { column: ['general', 'General'], value: 90, rgb: [95, 149, 192] },
                { column: ['holiday', 'Holiday'], value: 1000, rgb: [0, 137, 123] },
                { column: ['social', 'Social'], value: 65, rgb: [220, 202, 135] },
                { column: ['income', 'Income'], value: 1900, rgb: [151, 225, 160] },
                { column: ['spending', 'Out'], value: 2068, rgb: [191, 36, 36] },
                { column: ['net', 'Net'], value: -168, rgb: [191, 36, 36] },
                { column: ['predicted', 'Predicted'], value: 13334, rgb: [162, 228, 170] },
                { column: ['balance', 'Net Worth'], value: 19220, rgb: [36, 191, 55] }
            ]
        },
        {
            key: 'Mar-18',
            past: false,
            active: true,
            future: false,
            cells: [
                { column: ['month', 'Month'], value: 'Mar-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 102, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], value: 400, rgb: [219, 142, 142] },
                { column: ['food', 'Food'], value: 20, rgb: [173, 214, 175] },
                { column: ['general', 'General'], value: 10, rgb: [237, 243, 248] },
                { column: ['holiday', 'Holiday'], value: 95, rgb: [122, 194, 186] },
                { column: ['social', 'Social'], value: 134, rgb: [191, 158, 36] },
                { column: ['income', 'Income'], value: 1500, rgb: [173, 231, 180] },
                { column: ['spending', 'Out'], value: 659, rgb: [223, 146, 146] },
                { column: ['net', 'Net'], value: 841, rgb: [200, 239, 205] },
                { column: ['predicted', 'Predicted'], value: 20062, rgb: [36, 191, 55] },
                { column: ['balance', 'Net Worth'], value: 11876, rgb: [159, 227, 167] }
            ]
        },
        {
            key: 'Apr-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Apr-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 103, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], value: 650, rgb: [204, 94, 94] },
                { column: ['food', 'Food'], value: 26, rgb: [151, 202, 153] },
                { column: ['general', 'General'], value: 47, rgb: [168, 198, 221] },
                { column: ['holiday', 'Holiday'], value: 18, rgb: [215, 236, 234] },
                { column: ['social', 'Social'], value: 13, rgb: [248, 244, 230] },
                { column: ['income', 'Income'], value: 2500, rgb: [54, 196, 72] },
                { column: ['spending', 'Out'], value: 754, rgb: [221, 138, 138] },
                { column: ['net', 'Net'], value: 1746, rgb: [134, 220, 144] },
                { column: ['predicted', 'Predicted'], value: 13622, rgb: [160, 227, 168] },
                { column: ['balance', 'Net Worth'], value: 14981, rgb: [117, 215, 129] }
            ]
        },
        {
            key: 'May-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'May-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 104, rgb: [141, 158, 166] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 2300, rgb: [91, 207, 105] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 2093, rgb: [81, 204, 96] },
                { column: ['predicted', 'Predicted'], value: 15715, rgb: [146, 223, 155] },
                { column: ['balance', 'Net Worth'], value: 14230, rgb: [132, 219, 142] }
            ]
        },
        {
            key: 'Jun-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Jun-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 105, rgb: [113, 134, 144] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 1800, rgb: [156, 226, 165] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 1593, rgb: [151, 224, 160] },
                { column: ['predicted', 'Predicted'], value: 17309, rgb: [105, 211, 118] },
                { column: ['balance', 'Net Worth'], value: 12678, rgb: [152, 225, 161] }
            ]
        },
        {
            key: 'Jul-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Jul-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 106, rgb: [84, 110, 122] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 2600, rgb: [36, 191, 55] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 2393, rgb: [36, 191, 55] },
                { column: ['predicted', 'Predicted'], value: 19703, rgb: [45, 194, 63] },
                { column: ['balance', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        }
    ]);

    stub.restore();
});
