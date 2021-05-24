import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';

import type { Props as PropsListTree } from './list-tree';
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
import * as gql from '~client/hooks/gql';
import { blockPacker } from '~client/modules/block-packer';
import { sortByTotal } from '~client/modules/data';
import { breakpointBase } from '~client/styled/mixins';
import { breakpoints, colors } from '~client/styled/variables';
import type {
  AnalysisSortedTree,
  AnalysisTreeVisible,
  BlockItem,
  FlexBlocks,
  MainBlockName,
} from '~client/types';
import { AnalysisPage, AnalysisPeriod, AnalysisGroupBy } from '~client/types/enum';
import type {
  AnalysisDeepQuery,
  AnalysisQuery,
  AnalysisQueryVariables,
  CategoryCostTree,
  CategoryCostTreeDeep,
} from '~client/types/gql';
import type { GQL, NativeDate } from '~shared/types';

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
>(forest: K[], derived = false): AnalysisSortedTree<B>[] {
  return forest.map<AnalysisSortedTree<B>>(({ item, tree }) => ({
    name: item as B,
    derived,
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
  invested: number,
): AnalysisSortedTree<MainBlockName>[] {
  return [
    ...sortByTotal(getSortedTree<CategoryCostTree, MainBlockName>(cost)),
    { name: 'saved', derived: true, color: colors.blockColor.saved, total: saved },
    { name: 'invested', derived: true, color: colors.overview.balanceStocks, total: invested },
  ];
}

export function getBlocks(
  forest: AnalysisSortedTree<MainBlockName>[],
  width = ANALYSIS_VIEW_WIDTH,
  height = ANALYSIS_VIEW_HEIGHT,
  treeVisible: AnalysisTreeVisible = {},
): FlexBlocks<BlockItem> | null {
  return blockPacker<BlockItem>(
    width,
    height,
    forest
      .filter(({ name }) => treeVisible[name] !== false && name !== 'invested')
      .filter(({ name }) => !(treeVisible[AnalysisPage.Income] && name === 'saved'))
      .map((block) => ({
        name: block.name,
        total: block.total,
        color: getTreeColor(block.name),
        subTree: block.subTree,
        hasBreakdown: isStandardListPage(block.name),
      })),
  );
}

export const getDeepForest = (costDeep: CategoryCostTreeDeep[]): AnalysisSortedTree[] =>
  getSortedTree(costDeep);

export function getDeepBlocks(
  forestDeep: AnalysisSortedTree<string>[],
  width = ANALYSIS_VIEW_HEIGHT,
  height = ANALYSIS_VIEW_HEIGHT,
): FlexBlocks<BlockItem> | null {
  return forestDeep
    ? blockPacker<BlockItem>(
        width,
        height,
        forestDeep.map((block, index) => ({
          ...block,
          color: colors.blockIndex[index % colors.blockIndex.length],
        })),
      )
    : null;
}

const validateTreeVisible: PersistentStateValidator<AnalysisTreeVisible> = (
  value,
): value is AnalysisTreeVisible =>
  value !== null &&
  typeof value === 'object' &&
  Object.entries(value as Record<string, unknown>).every(
    ([key, keyValue]) => typeof key === 'string' && typeof keyValue === 'boolean',
  );

const defaultTreeVisible: AnalysisTreeVisible = { [AnalysisPage.Income]: false };

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

const defaultQuery: Query = {
  period: AnalysisPeriod.Year,
  groupBy: AnalysisGroupBy.Category,
  page: 0,
};

export type State = NativeDate<NonNullable<AnalysisQuery['analysis']>, 'startDate' | 'endDate'> & {
  income: number;
  saved: number;
};

const defaultState: State = {
  cost: [],
  income: 0,
  saved: 0,
  description: '',
  startDate: new Date(),
  endDate: new Date(),
};

function validateQuery(query: unknown | Query): Query {
  if (typeof query !== 'object' || query === null) {
    return defaultQuery;
  }

  const period = Object.values(AnalysisPeriod).includes(Reflect.get(query, 'period'))
    ? Reflect.get(query, 'period')
    : defaultQuery.period;
  const groupBy = Object.values(AnalysisGroupBy).includes(Reflect.get(query, 'groupBy'))
    ? Reflect.get(query, 'groupBy')
    : defaultQuery.groupBy;
  const page =
    Number(Reflect.get(query, 'page')) >= 0 ? parseInt(Reflect.get(query, 'page'), 10) : 0;

  return { period, groupBy, page };
}

export function useAnalysisData(params: unknown): [Query, State, boolean] {
  const query = validateQuery(params);
  const [{ data, fetching }] = gql.useAnalysisQuery({
    variables: query,
    requestPolicy: 'cache-and-network',
  });

  const stateWithoutSaved: Omit<State, 'income' | 'saved'> = data?.analysis
    ? {
        ...data.analysis,
        startDate: startOfDay(new Date(data.analysis.startDate)),
        endDate: endOfDay(new Date(data.analysis.endDate)),
      }
    : defaultState;

  const totalCost = stateWithoutSaved.cost.reduce<number>(
    (prev, next) =>
      next.item === AnalysisPage.Income
        ? prev
        : next.tree.reduce<number>((last, { sum }) => last + sum, prev),
    0,
  );

  const income =
    stateWithoutSaved.cost
      .find(({ item }) => item === AnalysisPage.Income)
      ?.tree.reduce<number>((last, { sum }) => last + sum, 0) ?? 0;

  const saved = Math.max(0, income - totalCost);

  const state: State = {
    ...stateWithoutSaved,
    income,
    saved,
  };

  return [query, state, fetching];
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
  const [{ data, fetching }] = gql.useAnalysisDeepQuery({
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
