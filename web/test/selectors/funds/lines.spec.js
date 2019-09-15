import test from 'ava';
import {
    getOverallAbsolute,
    getFundLineAbsolute,
    getOverallROI,
    getFundLineROI,
    getOverallLine,
    getFundLine,
    getFundLineProcessed
} from '~client/selectors/funds/lines';
import {
    GRAPH_FUNDS_OVERALL_ID,
    GRAPH_FUNDS_MODE_ROI,
    GRAPH_FUNDS_MODE_ABSOLUTE,
    GRAPH_FUNDS_MODE_PRICE
} from '~client/constants/graph';

test('getOverallAbsolute sums prices and return a line', t => {
    const prices = [
        [100, 102, 103],
        [0, 400, 399, 380, 386]
    ];

    const units = [
        [10, 10, 11],
        [0, 34, 34, 34, 28]
    ];

    const result = getOverallAbsolute(prices, units);

    const expectedResult = [
        100 * 10 + 0 * 0,
        102 * 10 + 400 * 34,
        103 * 11 + 399 * 34,
        380 * 34,
        386 * 28
    ];

    t.deepEqual(result, expectedResult);
});

test('getFundLineAbsolute gets the mapped product of units and prices', t => {
    const id = 'my-fund-id';
    const prices = { [id]: [100, 102, 103] };
    const units = { [id]: [34, 34, 18] };

    const result = getFundLineAbsolute(prices, units, id);

    const expectedResult = [3400, 3468, 1854];

    t.deepEqual(result, expectedResult);
});

test('getOverallROI gets the correct values and returns a line', t => {
    const prices = [
        [100, 102, 103],
        [0, 400, 399, 380, 386],
        [30, 31, 29, 0, 31]
    ];

    const units = [
        [10, 10, 11],
        [0, 34, 34, 34, 28],
        [10, 10, 10, 10, 10]
    ];

    const costs = [
        [1000, 1000, 1200],
        [0, 14000, 14000, 14000, 10800],
        [300, 300, 300, 300, 300]
    ];

    const rounded = (value) => Number(value.toPrecision(8));

    const result = getOverallROI(prices, units, costs);

    const expectedResult = [
        0,
        100 * ((102 * 10 + 400 * 34 + 31 * 10) - (1000 + 14000 + 300)) / (1000 + 14000 + 300),
        100 * ((103 * 11 + 399 * 34 + 29 * 10) - (1200 + 14000 + 300)) / (1200 + 14000 + 300),
        100 * ((380 * 34) - (14000)) / 14000,
        100 * ((386 * 28 + 31 * 10) - (10800 + 300)) / (10800 + 300)
    ];

    t.deepEqual(result.map(rounded), expectedResult.map(rounded));
});

test('getFundLineROI gets the correct values and returns a line', t => {
    const id = 'my-fund-id';
    const prices = { [id]: [100, 102, 103] };
    const units = { [id]: [34, 34, 18] };
    const costs = { [id]: [3100, 3100, 1560] };

    const result = getFundLineROI({ prices, units, costs }, id);

    const expectedResult = [
        100 * ((100 * 34) - 3100) / 3100,
        100 * ((102 * 34) - 3100) / 3100,
        100 * ((103 * 18) - 1560) / 1560
    ];

    t.deepEqual(result, expectedResult);
});

const id1 = 'my-fund-id';
const id2 = 'my-second-fund-id';

const priceUnitsCosts = {
    prices: {
        [id1]: [100, 102, 103],
        [id2]: [954, 961]
    },
    units: {
        [id1]: [34, 34, 18],
        [id2]: [105, 105]
    },
    costs: {
        [id1]: [3100, 3100, 1560],
        [id2]: [975400, 975400]
    }
};

const timeOffsets = {
    [id1]: 0,
    [id2]: 1
};

const times = [10000, 10030, 10632];

test('getOverallLine returns an absolute line if the mode is absolute', t => {
    t.deepEqual(getOverallLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ABSOLUTE, timeOffsets), [
        100 * 34 + 0,
        102 * 34 + 954 * 105,
        103 * 18 + 961 * 105
    ]);
});

test('getOverallLine returns an ROI line if the mode is ROI', t => {
    t.deepEqual(getOverallLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ROI, timeOffsets), [
        100 * ((100 * 34 + 0) - (3100 + 0)) / (3100 + 0),
        100 * ((102 * 34 + 954 * 105) - (3100 + 975400)) / (3100 + 975400),
        100 * ((103 * 18 + 961 * 105) - (1560 + 975400)) / (1560 + 975400)
    ]);
});

test('getOverallLine returns null if the mode is price', t => {
    t.is(getOverallLine(priceUnitsCosts, GRAPH_FUNDS_MODE_PRICE, timeOffsets), null);
});

test('getFundLine returns an absolute line if the mode is absolute', t => {
    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ABSOLUTE, id1), [
        100 * 34,
        102 * 34,
        103 * 18
    ]);

    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ABSOLUTE, id2), [
        954 * 105,
        961 * 105
    ]);
});

test('getFundLine returns an ROI line if the mode is ROI', t => {
    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ROI, id1), [
        100 * ((100 * 34) - 3100) / 3100,
        100 * ((102 * 34) - 3100) / 3100,
        100 * ((103 * 18) - 1560) / 1560
    ]);

    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_ROI, id2), [
        100 * ((954 * 105) - 975400) / 975400,
        100 * ((961 * 105) - 975400) / 975400
    ]);
});

test('getFundLine returns a price line if the mode is price', t => {
    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_PRICE, id1), [
        100,
        102,
        103
    ]);

    t.deepEqual(getFundLine(priceUnitsCosts, GRAPH_FUNDS_MODE_PRICE, id2), [
        954,
        961
    ]);
});

test('getFundLineProcessed processes a normal fund line', t => {
    t.deepEqual(getFundLineProcessed(times, timeOffsets, priceUnitsCosts, GRAPH_FUNDS_MODE_ROI, id1), [[
        [10000, 100 * ((100 * 34) - 3100) / 3100],
        [10030, 100 * ((102 * 34) - 3100) / 3100],
        [10632, 100 * ((103 * 18) - 1560) / 1560]
    ]]);
});

test('getFundLineProcessed processes an overall line', t => {
    t.deepEqual(getFundLineProcessed(times, timeOffsets, priceUnitsCosts, GRAPH_FUNDS_MODE_ROI, GRAPH_FUNDS_OVERALL_ID), [[
        [10000, 100 * ((100 * 34 + 0) - (3100 + 0)) / (3100 + 0)],
        [10030, 100 * ((102 * 34 + 954 * 105) - (3100 + 975400)) / (3100 + 975400)],
        [10632, 100 * ((103 * 18 + 961 * 105) - (1560 + 975400)) / (1560 + 975400)]
    ]]);
});
