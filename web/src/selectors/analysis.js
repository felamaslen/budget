import { createSelector } from 'reselect';

import { blockPacker } from '~client/modules/block-packer';
import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from '~client/constants/analysis';

export const getLoading = state => state.analysis.loading;
export const getLoadingDeep = state => state.analysis.loadingDeep;
export const getPeriod = state => state.analysis.period;
export const getGrouping = state => state.analysis.grouping;
export const getPage = state => state.analysis.page;

const getCostArray = state => state.analysis.cost;
const getSaved = state => state.analysis.saved;

export const getCost = createSelector(getCostArray, getSaved, (cost, saved) => cost && cost
    .map(([name, subTree]) => ({
        name,
        subTree: subTree.map(([item, total]) => ({ name: item, total })),
        total: subTree.reduce((sum, [, total]) => sum + total, 0)
    }))
    .concat([{ name: 'Saved', total: saved }]));

export const getBlocks = createSelector(getCost, cost => cost && blockPacker(cost, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT));
