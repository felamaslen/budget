import test from 'ava';
import { DateTime } from 'luxon';
import { fromJS } from 'immutable';
import {
    getStartDate,
    getEndDate,
    getNumRows,
    getBalance,
    getCurrentDate,
    getFutureMonths,
    getProcessedCost,
    getRowDates,
    getOverviewTable
} from '~client/selectors/overview';

const state = fromJS({
    now: DateTime.fromISO('2018-03-23T11:45:20Z'),
    pages: {
        overview: {
            startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
            endDate: DateTime.fromISO('2018-06-30T22:59:59.999Z'),
            cost: {
                old: [10000, 11500, 11200],
                funds: [94, 105, 110, 100, 101, 102, 103, 0, 0, 0],
                fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
                bills: [1000, 900, 400, 650, 0, 0, 0],
                food: [50, 13, 20, 19, 0, 0, 0],
                general: [150, 90, 10, 35, 0, 0, 0],
                holiday: [10, 1000, 95, 13, 0, 0, 0],
                social: [50, 65, 134, 10, 0, 0, 0]
            },
            data: {
                numRows: 7,
                numCols: 1
            },
            rows: [[13502], [19220], [11876], [14981], [14230], [12678], [0]]
        }
    }
});

test('getStartDate gets the start date', t => {
    t.deepEqual(getStartDate(state), DateTime.fromISO('2018-01-31T23:59:59.999Z'));
});

test('getEndDate gets the end date', t => {
    t.deepEqual(getEndDate(state), DateTime.fromISO('2018-06-30T22:59:59.999Z'));
});

test('getNumRows gets the numRows', t => {
    t.is(getNumRows(state), 7);
});

test('getBalance gets the balance items', t => {
    t.deepEqual(getBalance(state).toJS(), [13502, 19220, 11876, 14981, 14230, 12678, 0]);
});

test('getCurrentDate gets the end of the current day', t => {
    const result = getCurrentDate(state);

    t.deepEqual(result, DateTime.fromISO('2018-03-23T23:59:59.999Z'));
});
test('getCurrentDate nots reload the result if the day doesn\'t change', t => {
    const result = getCurrentDate(state);
    const nextResult = getCurrentDate(state.set('now', DateTime.fromISO('2018-03-23T15:20Z')));

    // notice this equality check is shallow, i.e. by reference, so if the date had
    // been recalculated, this test would fail :)
    t.is(nextResult, result);
});

test('getFutureMonths calculates the number of months in the future there are, based on the current date', t => {
    t.is(getFutureMonths(state), 3);
    t.is(getFutureMonths(state.set('now', DateTime.fromISO('2018-03-31T15:20Z'))), 3);
    t.is(getFutureMonths(state.set('now', DateTime.fromISO('2018-03-31T22:59Z'))), 3);

    t.is(getFutureMonths(state.set('now', DateTime.fromISO('2018-03-31T23:00Z'))), 2);
});

test('getRowDates gets a list of dates at the end of each month', t => {
    t.deepEqual(getRowDates(state).toJS(), [
        DateTime.fromISO('2018-01-31T23:59:59.999Z'),
        DateTime.fromISO('2018-02-28T23:59:59.999Z'),
        DateTime.fromISO('2018-03-31T22:59:59.999Z'),
        DateTime.fromISO('2018-04-30T22:59:59.999Z'),
        DateTime.fromISO('2018-05-31T22:59:59.999Z'),
        DateTime.fromISO('2018-06-30T22:59:59.999Z'),
        DateTime.fromISO('2018-07-31T22:59:59.999Z')
    ]);
});

test('getProcessedCost processs the cost data, including making predictions, adding spending / net columns etc.', t => {
    t.deepEqual(getProcessedCost(state).toJS(), {
        spending: [1260, 2068, 659, 754, 207, 207, 207],
        predicted: [13502, 13334, 20062, 13622, 15715, 17308, 19701],
        balanceWithPredicted: [13502, 19220, 11876, 14981, 15715, 17308, 19701],
        old: [10000, 11500, 11200],
        net: [740, -168, 841, 1746, 2093, 1593, 2393],
        fundsOld: [94, 105, 110],
        funds: [100, 101, 102, 103, 103, 103, 103],
        fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
        income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
        bills: [1000, 900, 400, 650, 0, 0, 0],
        food: [50, 13, 20, 26, 23, 23, 23],
        general: [150, 90, 10, 47, 69, 69, 69],
        social: [50, 65, 134, 13, 58, 58, 58],
        holiday: [10, 1000, 95, 18, 57, 57, 57]
    });
});

test('getOverviewTable gets a list of rows for the overview table', t => {
    t.deepEqual(getOverviewTable(state).toJS(), [
        {
            past: true,
            active: false,
            future: false,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Jan-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 100, rgb: [172, 185, 190] },
                { column: ['bills', 'Bills'], editable: false, value: 1000, rgb: [183, 28, 28] },
                { column: ['food', 'Food'], editable: false, value: 50, rgb: [67, 160, 71] },
                { column: ['general', 'General'], editable: false, value: 150, rgb: [1, 87, 155] },
                { column: ['holiday', 'Holiday'], editable: false, value: 10, rgb: [233, 245, 243] },
                { column: ['social', 'Social'], editable: false, value: 50, rgb: [227, 213, 161] },
                { column: ['income', 'Income'], editable: false, value: 2000, rgb: [146, 223, 155] },
                { column: ['spending', 'Out'], editable: false, value: 1260, rgb: [209, 99, 99] },
                { column: ['net', 'Net'], editable: false, value: 740, rgb: [206, 241, 211] },
                { column: ['predicted', 'Predicted'], editable: false, value: 13502, rgb: [161, 228, 169] },
                { column: ['balance', 'Net Worth'], editable: true, value: 13502, rgb: [146, 223, 155] }
            ]
        },
        {
            past: true,
            active: false,
            future: false,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Feb-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 101, rgb: [171, 184, 190] },
                { column: ['bills', 'Bills'], editable: false, value: 900, rgb: [189, 47, 47] },
                { column: ['food', 'Food'], editable: false, value: 13, rgb: [202, 228, 203] },
                { column: ['general', 'General'], editable: false, value: 90, rgb: [95, 149, 192] },
                { column: ['holiday', 'Holiday'], editable: false, value: 1000, rgb: [0, 137, 123] },
                { column: ['social', 'Social'], editable: false, value: 65, rgb: [220, 202, 135] },
                { column: ['income', 'Income'], editable: false, value: 1900, rgb: [151, 225, 160] },
                { column: ['spending', 'Out'], editable: false, value: 2068, rgb: [191, 36, 36] },
                { column: ['net', 'Net'], editable: false, value: -168, rgb: [191, 36, 36] },
                { column: ['predicted', 'Predicted'], editable: false, value: 13334, rgb: [162, 228, 170] },
                { column: ['balance', 'Net Worth'], editable: true, value: 19220, rgb: [36, 191, 55] }
            ]
        },
        {
            past: false,
            active: true,
            future: false,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Mar-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 102, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], editable: false, value: 400, rgb: [219, 142, 142] },
                { column: ['food', 'Food'], editable: false, value: 20, rgb: [173, 214, 175] },
                { column: ['general', 'General'], editable: false, value: 10, rgb: [237, 243, 248] },
                { column: ['holiday', 'Holiday'], editable: false, value: 95, rgb: [122, 194, 186] },
                { column: ['social', 'Social'], editable: false, value: 134, rgb: [191, 158, 36] },
                { column: ['income', 'Income'], editable: false, value: 1500, rgb: [173, 231, 180] },
                { column: ['spending', 'Out'], editable: false, value: 659, rgb: [223, 146, 146] },
                { column: ['net', 'Net'], editable: false, value: 841, rgb: [200, 239, 205] },
                { column: ['predicted', 'Predicted'], editable: false, value: 20062, rgb: [36, 191, 55] },
                { column: ['balance', 'Net Worth'], editable: true, value: 11876, rgb: [159, 227, 167] }
            ]
        },
        {
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Apr-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 103, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], editable: false, value: 650, rgb: [204, 94, 94] },
                { column: ['food', 'Food'], editable: false, value: 26, rgb: [151, 202, 153] },
                { column: ['general', 'General'], editable: false, value: 47, rgb: [168, 198, 221] },
                { column: ['holiday', 'Holiday'], editable: false, value: 18, rgb: [215, 236, 234] },
                { column: ['social', 'Social'], editable: false, value: 13, rgb: [248, 244, 230] },
                { column: ['income', 'Income'], editable: false, value: 2500, rgb: [54, 196, 72] },
                { column: ['spending', 'Out'], editable: false, value: 754, rgb: [221, 138, 138] },
                { column: ['net', 'Net'], editable: false, value: 1746, rgb: [134, 220, 144] },
                { column: ['predicted', 'Predicted'], editable: false, value: 13622, rgb: [160, 227, 168] },
                { column: ['balance', 'Net Worth'], editable: true, value: 14981, rgb: [117, 215, 129] }
            ]
        },
        {
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'May-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 103, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], editable: false, value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], editable: false, value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], editable: false, value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], editable: false, value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], editable: false, value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], editable: false, value: 2300, rgb: [91, 207, 105] },
                { column: ['spending', 'Out'], editable: false, value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], editable: false, value: 2093, rgb: [81, 204, 96] },
                { column: ['predicted', 'Predicted'], editable: false, value: 15715, rgb: [146, 223, 155] },
                { column: ['balance', 'Net Worth'], editable: true, value: 14230, rgb: [132, 219, 142] }
            ]
        },
        {
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Jun-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 103, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], editable: false, value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], editable: false, value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], editable: false, value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], editable: false, value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], editable: false, value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], editable: false, value: 1800, rgb: [156, 226, 165] },
                { column: ['spending', 'Out'], editable: false, value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], editable: false, value: 1593, rgb: [151, 224, 160] },
                { column: ['predicted', 'Predicted'], editable: false, value: 17308, rgb: [105, 211, 118] },
                { column: ['balance', 'Net Worth'], editable: true, value: 12678, rgb: [152, 225, 161] }
            ]
        },
        {
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], editable: false, value: 'Jul-18', rgb: null },
                { column: ['funds', 'Stocks'], editable: false, value: 103, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], editable: false, value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], editable: false, value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], editable: false, value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], editable: false, value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], editable: false, value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], editable: false, value: 2600, rgb: [36, 191, 55] },
                { column: ['spending', 'Out'], editable: false, value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], editable: false, value: 2393, rgb: [36, 191, 55] },
                { column: ['predicted', 'Predicted'], editable: false, value: 19701, rgb: [45, 194, 63] },
                { column: ['balance', 'Net Worth'], editable: true, value: 0, rgb: [255, 255, 255] }
            ]
        }
    ]);
});

