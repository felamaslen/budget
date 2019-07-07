import { createSelector } from 'reselect';

import { sortByTotal } from '~client/modules/data';
import { blockPacker } from '~client/modules/block-packer';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';

export const getLoading = state => state.analysis.loading;
export const getLoadingDeep = state => state.analysis.loadingDeep;
export const getPeriod = state => state.analysis.period;
export const getGrouping = state => state.analysis.grouping;
export const getPage = state => state.analysis.page;

export const getTreeVisible = state => state.analysis.treeVisible;

const getCostArray = state => state.analysis.cost;
const getSaved = state => state.analysis.saved;

const getSortedTree = ([name, subTree]) => ({
    name,
    subTree: sortByTotal(subTree.map(([item, total]) => ({ name: item, total }))),
    total: subTree.reduce((sum, [, total]) => sum + total, 0)
});

export const getCost = createSelector(getCostArray, getSaved, (cost, saved) => cost && sortByTotal(cost
    .map(getSortedTree)
    .concat([{ name: 'saved', total: saved }])
));

export const getBlocks = createSelector(getCost, getTreeVisible, (cost, treeVisible) => cost &&
    blockPacker(
        cost.filter(({ name }) => treeVisible[name] !== false),
        ANALYSIS_VIEW_WIDTH,
        ANALYSIS_VIEW_HEIGHT
    )
);

const getDeepArray = state => state.analysis.deep;

export const getDeepBlocks = createSelector(getDeepArray, cost => cost &&
    blockPacker(
        cost.map(getSortedTree),
        ANALYSIS_VIEW_WIDTH,
        ANALYSIS_VIEW_HEIGHT
    )
);
