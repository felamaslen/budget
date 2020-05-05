import { createSelector } from 'reselect';

import { sortByTotal } from '~client/modules/data';
import { blockPacker } from '~client/modules/block-packer';
import {
  ANALYSIS_VIEW_WIDTH,
  ANALYSIS_VIEW_HEIGHT,
  Period,
  Grouping,
} from '~client/constants/analysis';
import { State } from '~client/reducers';
import { Cost, TreeVisible } from '~client/reducers/analysis';
import { MainBlockName } from '~client/containers/PageAnalysis/types';

export const getLoading = (state: State): boolean => state.analysis.loading;
export const getLoadingDeep = (state: State): boolean => state.analysis.loadingDeep;
export const getPeriod = (state: State): Period => state.analysis.period;
export const getGrouping = (state: State): Grouping => state.analysis.grouping;
export const getPage = (state: State): number => state.analysis.page;
export const getTimeline = (state: State): number[][] | null => state.analysis.timeline;
export const getDescription = (state: State): string | null => state.analysis.description;

export const getTreeVisible = (state: State): TreeVisible => state.analysis.treeVisible;

const getCostArray = (state: State): Cost<MainBlockName> => state.analysis.cost;
const getSaved = (state: State): number => state.analysis.saved;

export type SortedTree<B extends string = string> = {
  name: B;
  subTree?: { name: string; total: number }[];
  total: number;
};

const getSortedTree = <B extends string = string>(tree: Cost<B>): SortedTree<B>[] =>
  tree.map(([name, subTree]) => ({
    name,
    subTree: sortByTotal(subTree.map(([item, total]) => ({ name: item, total }))),
    total: subTree.reduce((sum, [, total]) => sum + total, 0),
  }));

export const getCost = createSelector<
  State,
  Cost<MainBlockName>,
  number,
  SortedTree<MainBlockName>[]
>(getCostArray, getSaved, (cost, saved) => [
  ...sortByTotal(getSortedTree<MainBlockName>(cost)),
  { name: 'saved', total: saved },
]);

export const getBlocks = createSelector(getCost, getTreeVisible, (cost, treeVisible) =>
  blockPacker(
    cost.filter(({ name }: { name: MainBlockName }) => treeVisible[name] !== false),
    ANALYSIS_VIEW_WIDTH,
    ANALYSIS_VIEW_HEIGHT,
  ),
);

const getDeepArray = (state: State): Cost | null => state.analysis.costDeep;

export const getDeepCost = createSelector(getDeepArray, cost => cost && getSortedTree(cost));

export const getDeepBlocks = createSelector(
  getDeepCost,
  cost => cost && blockPacker(cost, ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT),
);
