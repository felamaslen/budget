import { createSelector } from 'reselect';

import {
  ANALYSIS_VIEW_WIDTH,
  ANALYSIS_VIEW_HEIGHT,
  Period,
  Grouping,
} from '~client/constants/analysis';
import { isCalcPage } from '~client/constants/data';
import { blockPacker } from '~client/modules/block-packer';
import { sortByTotal } from '~client/modules/data';
import { State } from '~client/reducers';
import { colors } from '~client/styled/variables';
import {
  AnalysisCost,
  MainBlockName,
  AnalysisSortedTree,
  BlockItem,
  Page,
  AnalysisTreeVisible,
  FlexBlocks,
} from '~client/types';

export const getLoading = (state: State): boolean => state.analysis.loading;
export const getLoadingDeep = (state: State): boolean => state.analysis.loadingDeep;
export const getAnalysisPeriod = (state: State): Period => state.analysis.period;
export const getGrouping = (state: State): Grouping => state.analysis.grouping;
export const getPage = (state: State): number => state.analysis.page;
export const getTimeline = (state: State): number[][] | null => state.analysis.timeline;
export const getDescription = (state: State): string | null => state.analysis.description;

const getCostArray = (state: State): AnalysisCost<MainBlockName> => state.analysis.cost;
const getSaved = (state: State): number => state.analysis.saved;

const getTreeColor = (name: MainBlockName | string): string | undefined => {
  if (isCalcPage(name)) {
    return colors[name].main;
  }
  if (name === 'saved') {
    return colors.blockColor.saved;
  }
  return undefined;
};

const getSortedTree = <B extends string = string>(tree: AnalysisCost<B>): AnalysisSortedTree<B>[] =>
  tree.map(([name, subTree]) => ({
    name,
    color: getTreeColor(name),
    subTree: sortByTotal(
      subTree.map(([item, total]) => ({
        name: item,
        total,
      })),
    ),
    total: subTree.reduce((sum, [, total]) => sum + total, 0),
  }));

export const getCostAnalysis = createSelector<
  State,
  AnalysisCost<MainBlockName>,
  number,
  AnalysisSortedTree<MainBlockName>[]
>(getCostArray, getSaved, (cost, saved) => [
  ...sortByTotal(getSortedTree<MainBlockName>(cost)),
  { name: 'saved', color: colors.blockColor.saved, total: saved },
]);

export const getBlocks = (
  width = ANALYSIS_VIEW_WIDTH,
  height = ANALYSIS_VIEW_HEIGHT,
  treeVisible: AnalysisTreeVisible = {},
): ((state: State) => FlexBlocks<BlockItem>) =>
  createSelector(getCostAnalysis, (cost) =>
    blockPacker<BlockItem>(
      width,
      height,
      cost
        .filter(({ name }: { name: MainBlockName }) => treeVisible[name] !== false)
        .map((block) => ({
          name: block.name,
          total: block.total,
          color: isCalcPage(block.name) ? colors[block.name].main : colors.blockColor.saved,
          subTree: block.subTree,
          hasBreakdown: isCalcPage(block.name) && block.name !== Page.bills,
        })),
    ),
  );

const getDeepArray = (state: State): AnalysisCost | null => state.analysis.costDeep;

export const getDeepCost = createSelector(getDeepArray, (cost) => cost && getSortedTree(cost));

export const getDeepBlocks = (
  width = ANALYSIS_VIEW_HEIGHT,
  height = ANALYSIS_VIEW_HEIGHT,
): ((state: State) => FlexBlocks<BlockItem> | undefined) =>
  createSelector(getDeepCost, (cost) =>
    cost
      ? blockPacker<BlockItem>(
          width,
          height,
          cost.map((block, index) => ({
            ...block,
            color: colors.blockIndex[index % colors.blockIndex.length],
          })),
        )
      : undefined,
  );
