import { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

import { Props as PropsListTree } from './list-tree';
import * as Styled from './styles';

import { statusHeight } from '~client/components/block-packer';
import { ANALYSIS_VIEW_HEIGHT, ANALYSIS_VIEW_WIDTH } from '~client/constants/analysis';
import { isStandardListPage } from '~client/constants/data';
import {
  PersistentStateValidator,
  ResizeContext,
  useMediaQuery,
  usePersistentState,
} from '~client/hooks';
import { blockPacker } from '~client/modules/block-packer';
import { sortByTotal } from '~client/modules/data';
import { breakpointBase } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';
import {
  AnalysisDeepQuery,
  AnalysisGroupBy,
  AnalysisPage,
  AnalysisPeriod,
  AnalysisQuery,
  AnalysisQueryVariables,
  AnalysisSortedTree,
  AnalysisTreeVisible,
  BlockItem,
  CategoryCostTree,
  CategoryCostTreeDeep,
  FlexBlocks,
  GQL,
  MainBlockName,
  PageListStandard,
  useAnalysisDeepQuery,
  useAnalysisQuery,
} from '~client/types';

const getTreeColor = (name: string): string | undefined => {
  if (isStandardListPage(name)) {
    return colors[name].main;
  }
  if (name === 'saved') {
    return colors.blockColor.saved;
  }
  return undefined;
};

export function getSortedTree<
  K extends CategoryCostTree | CategoryCostTreeDeep,
  B extends string = string
>(forest: K[]): AnalysisSortedTree<B>[] {
  return forest.map<AnalysisSortedTree<B>>(({ item, tree }) => ({
    name: item as B,
    color: getTreeColor(item),
    subTree: sortByTotal(
      tree.map(({ category, sum }) => ({
        name: category,
        total: sum,
      })),
    ),
    total: tree.reduce<number>((total, { sum }) => sum + total, 0),
  }));
}

export function getForest(
  cost: CategoryCostTree[],
  saved: number,
): AnalysisSortedTree<MainBlockName>[] {
  return [
    ...sortByTotal(getSortedTree<CategoryCostTree, MainBlockName>(cost)),
    { name: 'saved', color: colors.blockColor.saved, total: saved },
  ];
}

export function getBlocks(
  forest: AnalysisSortedTree<MainBlockName>[],
  width = ANALYSIS_VIEW_WIDTH,
  height = ANALYSIS_VIEW_HEIGHT,
  treeVisible: AnalysisTreeVisible = {},
): FlexBlocks<BlockItem> {
  return blockPacker<BlockItem>(
    width,
    height,
    forest
      .filter(({ name }) => treeVisible[name] !== false)
      .map((block) => ({
        name: block.name,
        total: block.total,
        color: getTreeColor(block.name),
        subTree: block.subTree,
        hasBreakdown: isStandardListPage(block.name) && block.name !== PageListStandard.Bills,
      })),
  );
}

export const getDeepForest = (costDeep: CategoryCostTreeDeep[]): AnalysisSortedTree[] =>
  getSortedTree(costDeep);

export function getDeepBlocks(
  forestDeep: AnalysisSortedTree<string>[],
  width = ANALYSIS_VIEW_HEIGHT,
  height = ANALYSIS_VIEW_HEIGHT,
): FlexBlocks<BlockItem> | undefined {
  return forestDeep
    ? blockPacker<BlockItem>(
        width,
        height,
        forestDeep.map((block, index) => ({
          ...block,
          color: colors.blockIndex[index % colors.blockIndex.length],
        })),
      )
    : undefined;
}

const validateTreeVisible: PersistentStateValidator<AnalysisTreeVisible> = (
  value,
): value is AnalysisTreeVisible =>
  value !== null &&
  typeof value === 'object' &&
  Object.entries(value as Record<string, unknown>).every(
    ([key, keyValue]) => typeof key === 'string' && typeof keyValue === 'boolean',
  );

const defaultTreeVisible: AnalysisTreeVisible = { [AnalysisPage.Bills]: false };

const keyTreeVisible = 'analysis_treeVisible';

export function useTreeToggle(): [AnalysisTreeVisible, PropsListTree['toggleTreeItem']] {
  const [treeVisible, setTreeVisible] = usePersistentState<AnalysisTreeVisible>(
    defaultTreeVisible,
    keyTreeVisible,
    validateTreeVisible,
  );

  const toggleTreeItem = useCallback(
    (name: MainBlockName) =>
      setTreeVisible((last) => ({
        ...last,
        [name]: last[name] === false,
      })),
    [setTreeVisible],
  );

  return [treeVisible, toggleTreeItem];
}

export type Query = GQL<AnalysisQueryVariables>;

const keyQuery = 'analysis_state';

const defaultQuery: Query = {
  period: AnalysisPeriod.Year,
  groupBy: AnalysisGroupBy.Category,
  page: 0,
};

export type State = NonNullable<AnalysisQuery['analysis']>;

const defaultState: State = {
  timeline: [],
  cost: [],
  saved: 0,
  description: '',
};

export function useAnalysisData(): [Query, (query: Partial<Query>) => void, State, boolean] {
  const [query, setQuery] = usePersistentState<Query>(defaultQuery, keyQuery);
  const onRequest = useCallback(
    (delta: Partial<Query>): void => {
      setQuery((last: Query) => ({ ...last, ...delta }));
    },
    [setQuery],
  );

  const [{ data, fetching }] = useAnalysisQuery({
    variables: query,
  });

  return [query, onRequest, data?.analysis ?? defaultState, fetching];
}

export function useAnalysisDeepBlock(
  mainQuery: Query,
): [
  AnalysisPage | null,
  Dispatch<SetStateAction<AnalysisPage | null>>,
  NonNullable<AnalysisDeepQuery['analysisDeep']> | null,
  boolean,
] {
  const [category, setCategory] = useState<AnalysisPage | null>(null);
  const [{ data, fetching }] = useAnalysisDeepQuery({
    variables: { ...mainQuery, category: category as AnalysisPage },
    pause: !category,
  });

  return [category, setCategory, category ? data?.analysisDeep ?? null : null, fetching];
}

export function useBlockDimensions(): { width: number; height: number } {
  const windowWidth = useContext(ResizeContext);
  const largerThanSmallMobile = useMediaQuery(breakpointBase(breakpoints.mobileSmall));
  const isDesktop = useMediaQuery(breakpointBase(breakpoints.tablet));

  if (!isDesktop) {
    return {
      width: windowWidth,
      height:
        (largerThanSmallMobile ? Styled.blocksHeightMobile : breakpoints.mobileSmall) -
        statusHeight,
    };
  }

  return { width: ANALYSIS_VIEW_WIDTH, height: ANALYSIS_VIEW_HEIGHT - statusHeight };
}
