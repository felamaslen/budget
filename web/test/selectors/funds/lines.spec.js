import test from 'ava';
import { List as list } from 'immutable';
import {
    getOverallAbsolute,
    getOverallROI
} from '~client/selectors/funds/lines';

test('getOverallAbsolute sums prices and return a line', t => {
    const prices = list([
        list([100, 102, 103]),
        list([0, 400, 399, 380, 386])
    ]);

    const units = list([
        list([10, 10, 11]),
        list([0, 34, 34, 34, 28])
    ]);

    const result = getOverallAbsolute(prices, units);

    const expectedResult = [
        100 * 10 + 0 * 0,
        102 * 10 + 400 * 34,
        103 * 11 + 399 * 34,
        380 * 34,
        386 * 28
    ];

    t.deepEqual(result.toJS(), expectedResult);
});

test.todo('getFundLineAbsolute');

test('getOverallROI gets the correct values and return a line', t => {
    const prices = list([
        list([100, 102, 103]),
        list([0, 400, 399, 380, 386]),
        list([30, 31, 29, 0, 31])
    ]);

    const units = list([
        list([10, 10, 11]),
        list([0, 34, 34, 34, 28]),
        list([10, 10, 10, 10, 10])
    ]);

    const costs = list([
        list([1000, 1000, 1200]),
        list([0, 14000, 14000, 14000, 10800]),
        list([300, 300, 300, 300, 300])
    ]);

    const result = getOverallROI(prices, units, costs);

    const expectedResult = [
        0,
        100 * ((102 * 10 + 400 * 34 + 31 * 10) - (1000 + 14000 + 300)) / (1000 + 14000 + 300),
        100 * ((103 * 11 + 399 * 34 + 29 * 10) - (1200 + 14000 + 300)) / (1200 + 14000 + 300),
        100 * ((380 * 34) - (14000)) / 14000,
        100 * ((386 * 28 + 31 * 10) - (10800 + 300)) / (10800 + 300)
    ];

    t.deepEqual(result.toJS(), expectedResult);
});

test.todo('getFundLineROI');

test.todo('getFundLinePrice');

test.todo('getOverallLine');

test.todo('getFundLine');

test.todo('getFundLineProcessed');
