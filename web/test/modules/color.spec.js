import test from 'ava';
import {
    rgba,
    getOverviewCategoryColor,
    getOverviewScoreColor,
    colorKey,
    averageColor
} from '~client/modules/color';

test('rgba returns rgba for four values', t => {
    t.is(rgba([254, 19, 99, 0.4]), 'rgba(254,19,99,0.4)');
});

test('rgba returns rgb for three values', t => {
    t.is(rgba([0, 92, 29]), 'rgb(0,92,29)');
});

test('getOverviewCategoryColor returns the correct colour list', t => {
    t.deepEqual(getOverviewCategoryColor(), {
        funds: [84, 110, 122],
        bills: [183, 28, 28],
        food: [67, 160, 71],
        general: [1, 87, 155],
        holiday: [0, 137, 123],
        social: [191, 158, 36],
        income: [36, 191, 55],
        spending: [191, 36, 36],
        net: [
            [191, 36, 36],
            [36, 191, 55]
        ],
        netWorthPredicted: [
            [191, 36, 36],
            [36, 191, 55]
        ],
        netWorth: [
            [191, 36, 36],
            [36, 191, 55]
        ]
    });
});

test('getOverviewScoreColor returns white if the range is zero', t => {
    t.deepEqual(getOverviewScoreColor(10, { min: 1, max: 1 }), [255, 255, 255]);
});

test('getOverviewScoreColor returns white if the value is zero', t => {
    t.deepEqual(getOverviewScoreColor(0, { min: 1, max: 1 }), [255, 255, 255]);
    t.deepEqual(getOverviewScoreColor(0, { min: 0, max: 1 }), [255, 255, 255]);
    t.deepEqual(getOverviewScoreColor(0, { min: -1, max: 1 }), [255, 255, 255]);
});

test('getOverviewScoreColor returns white if the (positive) value is less than the minimum', t => {
    t.deepEqual(getOverviewScoreColor(1, { min: 3, max: 10 }, { positive: 7 }, [36, 106, 43]),
        [255, 255, 255]);

    t.deepEqual(getOverviewScoreColor(-2, { min: 3, max: 10 }, { positive: 7 }, [36, 106, 43]),
        [255, 255, 255]);
});

test('getOverviewScoreColor returns white if the (negative) value is greater than the maximum', t => {
    t.deepEqual(getOverviewScoreColor(-1, { min: -3, max: -10 }, { negative: -7 }, [36, 106, 43]),
        [255, 255, 255]);

    t.deepEqual(getOverviewScoreColor(3.1, { min: -3, max: -10 }, { negative: -7 }, [36, 106, 43]),
        [255, 255, 255]);
});

test('getOverviewScoreColor gets the correct color', t => {
    t.deepEqual(getOverviewScoreColor(
        10,
        { min: -10, max: 20 },
        { negative: -4, positive: 8 },
        [160, 44, 92]
    ), [200, 132, 160]);

    t.deepEqual(getOverviewScoreColor(
        -9.4,
        { min: -10, max: 20 },
        { negative: -4, positive: 8 },
        [[160, 44, 92], [9, 119, 203]]
    ), [165, 55, 100]);
});

const range = {
    min: -10,
    maxNegative: -3,
    minPositive: 4,
    max: 11
};

const median = {
    negative: -6,
    positive: 5.5
};

const color = [[36, 230, 105], [10, 51, 210]];

test('getOverviewScoreColor separate non-zero-bound ranges: negative below lower bound', t => {
    t.deepEqual(getOverviewScoreColor(-11, range, median, color), [36, 230, 105]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative minimum', t => {
    t.deepEqual(getOverviewScoreColor(-10, range, median, color), [36, 230, 105]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative median', t => {
    t.deepEqual(getOverviewScoreColor(-6, range, median, color), [146, 243, 180]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative maximum', t => {
    t.deepEqual(getOverviewScoreColor(-3, range, median, color), [255, 255, 255]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: negative above upper bound', t => {
    t.deepEqual(getOverviewScoreColor(-1, range, median, color), [255, 255, 255]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: zero', t => {
    t.deepEqual(getOverviewScoreColor(0, range, median, color), [255, 255, 255]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive below lower bound', t => {
    t.deepEqual(getOverviewScoreColor(3, range, median, color), [255, 255, 255]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive minimum', t => {
    t.deepEqual(getOverviewScoreColor(4, range, median, color), [255, 255, 255]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive median', t => {
    t.deepEqual(getOverviewScoreColor(5.5, range, median, color), [133, 153, 233]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive maximum', t => {
    t.deepEqual(getOverviewScoreColor(11, range, median, color), [10, 51, 210]);
});

test('getOverviewScoreColor separate non-zero-bound ranges: positive above upper bound', t => {
    t.deepEqual(getOverviewScoreColor(13, range, median, color), [10, 51, 210]);
});

test('colorKey returns different colours for other numbers', t => {
    t.true(Array.isArray(colorKey('foo')));
    t.is(colorKey('foo').length, 3);
    t.notDeepEqual(colorKey('foo'), [0, 0, 0]);

    t.true(Array.isArray(colorKey('bar')));
    t.is(colorKey('bar').length, 3);
    t.notDeepEqual(colorKey('bar'), colorKey('foo'));
});

test('averageColor returns an average colour', t => {
    t.deepEqual(averageColor([
        [123, 245, 3],
        [255, 2, 30],
        [39, 128, 255]
    ]), [139, 125, 96]);
});

test('averageColor returns transparent by default', t => {
    t.deepEqual(averageColor([]), [255, 255, 255, 0]);
});
