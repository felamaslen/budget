import { createSelector } from 'reselect';

import {
  ANALYSIS_VIEW_WIDTH,
  ANALYSIS_VIEW_HEIGHT,
  Period,
  Grouping,
} from '~client/constants/analysis';
import { blockPacker } from '~client/modules/block-packer';
import { sortByTotal } from '~client/modules/data';
import { State } from '~client/reducers';
import {
  AnalysisCost,
  AnalysisTreeVisible,
  MainBlockName,
  AnalysisSortedTree,
} from '~client/types';

export const getLoading = (state: State): boolean => state.analysis.loading;
export const getLoadingDeep = (state: State): boolean => state.analysis.loadingDeep;
export const getAnalysisPeriod = (state: State): Period => state.analysis.period;
export const getGrouping = (state: State): Grouping => state.analysis.grouping;
export const getPage = (state: State): number => state.analysis.page;
export const getTimeline = (state: State): number[][] | null => state.analysis.timeline;
export const getDescription = (state: State): string | null => state.analysis.description;

export const getTreeVisible = (state: State): AnalysisTreeVisible => state.analysis.treeVisible;

const getCostArray = (state: State): AnalysisCost<MainBlockName> => state.analysis.cost;
const getSaved = (state: State): number => state.analysis.saved;

const getSortedTree = <B extends string = string>(tree: AnalysisCost<B>): AnalysisSortedTree<B>[] =>
  tree.map(([name, subTree]) => ({
    name,
    subTree: sortByTotal(subTree.map(([item, total]) => ({ name: item, total }))),
    total: subTree.reduce((sum, [, total]) => sum + total, 0),
  }));

export const getCostAnalysis = createSelector<
  State,
  AnalysisCost<MainBlockName>,
  number,
  AnalysisSortedTree<MainBlockName>[]
>(getCostArray, getSaved, (cost, saved) => [
  ...sortByTotal(getSortedTree<MainBlockName>(cost)),
  { name: 'saved', total: saved },
]);

export const getBlocks = createSelector(getCostAnalysis, getTreeVisible, (cost, treeVisible) =>
  blockPacker(
    cost.filter(({ name }: { name: MainBlockName }) => treeVisible[name] !== false),
    ANALYSIS_VIEW_WIDTH,
    ANALYSIS_VIEW_HEIGHT,
  ),
);

const getDeepArray = (state: State): AnalysisCost | null => state.analysis.costDeep;

export const getDeepCost = createSelector(getDeepArray, (cost) => cost && getSortedTree(cost));

export const getDeepBlocks = createSelector(
  getDeepCost,
  (cost) => cost && blockPacker(cost, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT),
);
