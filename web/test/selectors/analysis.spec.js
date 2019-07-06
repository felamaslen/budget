import test from 'ava';
import {
    getLoading,
    getLoadingDeep,
    getPeriod,
    getGrouping,
    getPage,
    getCost,
    getBlocks
} from '~client/selectors/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';
import { testState } from '~client-test/test_data/state';

test('getLoading gets the loading status', t => t.is(getLoading({
    analysis: {
        loading: true
    }
}), true));

test('getLoadingDeep gets the loading (deep block) status', t => t.is(getLoadingDeep({
    analysis: {
        loadingDeep: true
    }
}), true));

test('getPeriod gets the period', t => t.is(getPeriod({
    analysis: {
        period: 'year'
    }
}), 'year'));

test('getGrouping gets the grouping', t => t.is(getGrouping({
    analysis: {
        grouping: 'category'
    }
}), 'category'));

test('getPage gets the page', t => t.is(getPage({
    analysis: {
        page: 3
    }
}), 3));

test('getCost returns the cost data mapped into subtrees', t => {
    const expectedResult = [
        {
            name: 'foo1',
            subTree: [
                { name: 'foo1_bar1', total: 1642283 }
            ],
            total: 1642283
        },
        {
            name: 'foo2',
            subTree: [
                { name: 'foo2_bar1', total: 156842 },
                { name: 'foo2_bar2', total: 137650 }
            ],
            total: 156842 + 137650
        },
        {
            name: 'Saved',
            total: testState.analysis.saved
        }
    ];

    const result = getCost(testState);

    t.deepEqual(result, expectedResult);
});

test('getBlocks gets a block-packed map of the state', t => {
    const result = getBlocks(testState);

    t.true(result.length > 0);
    t.deepEqual(result, blockPacker(getCost(testState), ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT));
});
