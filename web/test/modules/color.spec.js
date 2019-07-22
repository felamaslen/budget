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

test('getOverviewScoreColor gets the correct color', t => {
    t.deepEqual(getOverviewScoreColor(
        10,
        { min: -10, max: 20 },
        { negative: 4, positive: 8 },
        [160, 44, 92]
    ), [200, 132, 160]);

    t.deepEqual(getOverviewScoreColor(
        -9.4,
        { min: -10, max: 20 },
        { negative: 4, positive: 8 },
        [[160, 44, 92], [9, 119, 203]]
    ), [165, 55, 100]);
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
