import test from 'ava';
import {
    getLoading,
    getLoadingDeep,
    getPeriod,
    getGrouping,
    getPage,
    getCost,
    getBlocks,
    getDeepBlocks,
} from '~client/selectors/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';
import { testState } from '~client-test/test_data/state';

test('getLoading gets the loading status', (t) => t.is(getLoading({
    analysis: {
        loading: true,
    },
}), true));

test('getLoadingDeep gets the loading (deep block) status', (t) => t.is(getLoadingDeep({
    analysis: {
        loadingDeep: true,
    },
}), true));

test('getPeriod gets the period', (t) => t.is(getPeriod({
    analysis: {
        period: 'year',
    },
}), 'year'));

test('getGrouping gets the grouping', (t) => t.is(getGrouping({
    analysis: {
        grouping: 'category',
    },
}), 'category'));

test('getPage gets the page', (t) => t.is(getPage({
    analysis: {
        page: 3,
    },
}), 3));

test('getCost returns the cost data, ordered and mapped into subtrees', (t) => {
    const expectedResult = [
        {
            name: 'foo1',
            subTree: [
                { name: 'foo1_bar1', total: 1642283 },
            ],
            total: 1642283,
        },
        {
            name: 'foo2',
            subTree: [
                { name: 'foo2_bar1', total: 156842 },
                { name: 'foo2_bar2', total: 137650 },
            ],
            total: 156842 + 137650,
        },
        {
            name: 'saved',
            total: testState.analysis.saved,
        },
    ];

    const result = getCost(testState);

    t.deepEqual(result, expectedResult);
});

test('getCost doesn\'t throw an error if cost is null', (t) => {
    t.notThrows(() => getCost({
        ...testState,
        analysis: {
            ...testState.analysis,
            cost: null,
        },
    }));
});

test('getBlocks gets a block-packed map of the state', (t) => {
    const result = getBlocks(testState);

    t.true(result.length > 0);
    t.deepEqual(result, blockPacker(getCost(testState), ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT));
});

test('getBlocks excludes blocks which are not in the visible tree', (t) => {
    const result = getBlocks({
        ...testState,
        analysis: {
            ...testState.analysis,
            treeVisible: {
                foo1: false,
            },
        },
    });

    t.deepEqual(result, blockPacker(getCost({
        ...testState,
        analysis: {
            ...testState.analysis,
            cost: testState.analysis.cost.filter(([name]) => name !== 'foo1'),
        },
    }), ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT));
});

test('getDeepBlocks gets a block-packed map of the state', (t) => {
    const result = getDeepBlocks({
        ...testState,
        analysis: {
            ...testState.analysis,
            costDeep: [
                ['foo2_bar2_baz1', [
                    ['foo2_bar2_baz1_bak1', 100],
                    ['foo2_bar2_baz1_bak2', 130],
                    ['foo2_bar2_baz1_bak3', 93],
                ]],
                ['foo2_bar2_baz2', [
                    ['foo2_bar2_baz2_bak1', 30],
                    ['foo2_bar2_baz2_bak2', 992],
                ]],
            ],
        },
    });

    t.true(result.length > 0);
    t.deepEqual(result, blockPacker([
        {
            name: 'foo2_bar2_baz1',
            total: 100 + 130 + 93,
            subTree: [
                { name: 'foo2_bar2_baz1_bak1', total: 100 },
                { name: 'foo2_bar2_baz1_bak2', total: 130 },
                { name: 'foo2_bar2_baz1_bak3', total: 93 },
            ],
        },
        {
            name: 'foo2_bar2_baz2',
            total: 30 + 992,
            subTree: [
                { name: 'foo2_bar2_baz2_bak1', total: 30 },
                { name: 'foo2_bar2_baz2_bak2', total: 992 },
            ],
        },
    ], ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT));
});
