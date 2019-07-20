import test from 'ava';
import sinon from 'sinon';

import { testState as state } from '~client-test/test_data/state';
import {
    getProcessedCost,
    getOverviewTable
} from '~client/selectors/overview';
import { getNetWorthSummary } from '~client/selectors/overview/net-worth';

const testRandoms = [0.15, 0.99];

const getRandomStub = () => {
    let randomIndex = 0;

    return sinon.stub(Math, 'random').callsFake(() => testRandoms[(randomIndex++) % 2]);
};

test('getProcessedCost processes the cost data, including making predictions, adding spending / net columns etc.', t => {
    const stub = getRandomStub();
    const netWorthSummary = getNetWorthSummary(state);

    const netWorthPredicted = [
        netWorthSummary[0],
        netWorthSummary[0] - 168,
        netWorthSummary[1] + 841 + 102981 - 101459,
        netWorthSummary[2] + 1746,
        (netWorthSummary[2] + 1746) + 2093, // first future row
        (netWorthSummary[2] + 1746) + 2093 + 1593,
        (netWorthSummary[2] + 1746) + 2093 + 1593 + 2393
    ];

    t.deepEqual(getProcessedCost(state), {
        spending: [1260, 2068, 659, 754, 207, 207, 207],
        net: [740, -168, 841, 1746, 2093, 1593, 2393],
        fundsOld: [94004, 105390, 110183],
        funds: [100779, 101459, 102981, 103293, 106162, 109111, 112141],
        fundChanges: [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
        income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
        bills: [1000, 900, 400, 650, 0, 0, 0],
        food: [50, 13, 20, 26, 23, 23, 23],
        general: [150, 90, 10, 47, 69, 69, 69],
        social: [50, 65, 134, 13, 58, 58, 58],
        holiday: [10, 1000, 95, 18, 57, 57, 57],
        netWorthPredicted,
        netWorthCombined: getNetWorthSummary(state)
            .slice(0, -4)
            .concat(netWorthPredicted.slice(-4)),
        netWorth: getNetWorthSummary(state)
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
                { column: ['funds', 'Stocks'], value: 100779, rgb: [172, 184, 190] },
                { column: ['bills', 'Bills'], value: 1000, rgb: [183, 28, 28] },
                { column: ['food', 'Food'], value: 50, rgb: [67, 160, 71] },
                { column: ['general', 'General'], value: 150, rgb: [1, 87, 155] },
                { column: ['holiday', 'Holiday'], value: 10, rgb: [233, 245, 243] },
                { column: ['social', 'Social'], value: 50, rgb: [227, 213, 161] },
                { column: ['income', 'Income'], value: 2000, rgb: [146, 223, 155] },
                { column: ['spending', 'Out'], value: 1260, rgb: [209, 99, 99] },
                { column: ['net', 'Net'], value: 740, rgb: [206, 241, 211] },
                { column: ['netWorthPredicted', 'Predicted'], value: 0, rgb: [255, 255, 255] },
                { column: ['netWorth', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        },
        {
            key: 'Feb-18',
            past: true,
            active: false,
            future: false,
            cells: [
                { column: ['month', 'Month'], value: 'Feb-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 101459, rgb: [171, 184, 190] },
                { column: ['bills', 'Bills'], value: 900, rgb: [189, 47, 47] },
                { column: ['food', 'Food'], value: 13, rgb: [202, 228, 203] },
                { column: ['general', 'General'], value: 90, rgb: [95, 149, 192] },
                { column: ['holiday', 'Holiday'], value: 1000, rgb: [0, 137, 123] },
                { column: ['social', 'Social'], value: 65, rgb: [220, 202, 135] },
                { column: ['income', 'Income'], value: 1900, rgb: [151, 225, 160] },
                { column: ['spending', 'Out'], value: 2068, rgb: [191, 36, 36] },
                { column: ['net', 'Net'], value: -168, rgb: [191, 36, 36] },
                { column: ['netWorthPredicted', 'Predicted'], value: -168, rgb: [191, 36, 36] },
                { column: ['netWorth', 'Net Worth'], value: 1298227.25, rgb: [36, 191, 55] }
            ]
        },
        {
            key: 'Mar-18',
            past: false,
            active: true,
            future: false,
            cells: [
                { column: ['month', 'Month'], value: 'Mar-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 102981, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], value: 400, rgb: [219, 142, 142] },
                { column: ['food', 'Food'], value: 20, rgb: [173, 214, 175] },
                { column: ['general', 'General'], value: 10, rgb: [237, 243, 248] },
                { column: ['holiday', 'Holiday'], value: 95, rgb: [122, 194, 186] },
                { column: ['social', 'Social'], value: 134, rgb: [191, 158, 36] },
                { column: ['income', 'Income'], value: 1500, rgb: [173, 231, 180] },
                { column: ['spending', 'Out'], value: 659, rgb: [223, 146, 146] },
                { column: ['net', 'Net'], value: 841, rgb: [200, 239, 205] },
                { column: ['netWorthPredicted', 'Predicted'], value: 1300590.25, rgb: [36, 191, 55] },
                { column: ['netWorth', 'Net Worth'], value: 1039156, rgb: [58, 197, 75] }
            ]
        },
        {
            key: 'Apr-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Apr-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 103293, rgb: [170, 183, 189] },
                { column: ['bills', 'Bills'], value: 650, rgb: [204, 94, 94] },
                { column: ['food', 'Food'], value: 26, rgb: [151, 202, 153] },
                { column: ['general', 'General'], value: 47, rgb: [168, 198, 221] },
                { column: ['holiday', 'Holiday'], value: 18, rgb: [215, 236, 234] },
                { column: ['social', 'Social'], value: 13, rgb: [248, 244, 230] },
                { column: ['income', 'Income'], value: 2500, rgb: [54, 196, 72] },
                { column: ['spending', 'Out'], value: 754, rgb: [221, 138, 138] },
                { column: ['net', 'Net'], value: 1746, rgb: [134, 220, 144] },
                { column: ['netWorthPredicted', 'Predicted'], value: 1040902, rgb: [146, 223, 155] },
                { column: ['netWorth', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        },
        {
            key: 'May-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'May-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 106162, rgb: [142, 159, 167] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 2300, rgb: [91, 207, 105] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 2093, rgb: [81, 204, 96] },
                { column: ['netWorthPredicted', 'Predicted'], value: 1042995, rgb: [146, 223, 155] },
                { column: ['netWorth', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        },
        {
            key: 'Jun-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Jun-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 109111, rgb: [113, 135, 145] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 1800, rgb: [156, 226, 165] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 1593, rgb: [151, 224, 160] },
                { column: ['netWorthPredicted', 'Predicted'], value: 1044588, rgb: [145, 223, 155] },
                { column: ['netWorth', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        },
        {
            key: 'Jul-18',
            past: false,
            active: false,
            future: true,
            cells: [
                { column: ['month', 'Month'], value: 'Jul-18', rgb: null },
                { column: ['funds', 'Stocks'], value: 112141, rgb: [84, 110, 122] },
                { column: ['bills', 'Bills'], value: 0, rgb: [255, 255, 255] },
                { column: ['food', 'Food'], value: 23, rgb: [161, 208, 163] },
                { column: ['general', 'General'], value: 69, rgb: [128, 171, 205] },
                { column: ['holiday', 'Holiday'], value: 57, rgb: [128, 196, 189] },
                { column: ['social', 'Social'], value: 58, rgb: [223, 207, 146] },
                { column: ['income', 'Income'], value: 2600, rgb: [36, 191, 55] },
                { column: ['spending', 'Out'], value: 207, rgb: [245, 221, 221] },
                { column: ['net', 'Net'], value: 2393, rgb: [36, 191, 55] },
                { column: ['netWorthPredicted', 'Predicted'], value: 1046981, rgb: [144, 223, 154] },
                { column: ['netWorth', 'Net Worth'], value: 0, rgb: [255, 255, 255] }
            ]
        }
    ]);

    stub.restore();
});
