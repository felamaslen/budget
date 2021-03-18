import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RouteComponentProps } from 'react-router';

import {
  getBlocks,
  getForest,
  getDeepBlocks,
  getDeepForest,
  Query,
  useAnalysisData,
  useAnalysisDeepBlock,
  useBlockDimensions,
  useTreeToggle,
} from './hooks';
import ListTree from './list-tree';
import * as Styled from './styles';
import Upper from './upper';

import { BlockName, BlockPacker } from '~client/components/block-packer';
import { isAnalysisPage } from '~client/constants/data';
import { formatCurrency, capitalise } from '~client/modules/format';
import { getInvestmentsBetweenDates } from '~client/selectors';
import type { GQL } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import { CategoryCostTree, CategoryCostTreeDeep } from '~client/types/gql';

export type RouteParams = {
  groupBy?: string;
  period?: string;
  page?: string;
};

export const PageAnalysis: React.FC<RouteComponentProps<RouteParams>> = ({ match, history }) => {
  const [
    query,
    { cost, income, saved, description, startDate, endDate },
    loading,
  ] = useAnalysisData(match.params);

  const onRequest = useCallback(
    (delta: Partial<Query>) => {
      const nextQuery = { ...query, ...delta };
      history.replace(`/analysis/${nextQuery.groupBy}/${nextQuery.period}/${nextQuery.page ?? 0}`);
    },
    [query, history],
  );

  useEffect(() => {
    if (!Object.keys(match.params).length) {
      onRequest({});
    }
  }, [match.params, onRequest]);

  const invested = useSelector(getInvestmentsBetweenDates(startDate, endDate));

  const [treeVisible, toggleTreeItem] = useTreeToggle();

  const { width, height } = useBlockDimensions();

  const forest = useMemo(() => getForest(cost, saved, invested), [cost, saved, invested]);
  const blocks = useMemo(() => getBlocks(forest, width, height, treeVisible), [
    forest,
    treeVisible,
    width,
    height,
  ]);

  const [, setCategoryDeep, costDeep, loadingDeep] = useAnalysisDeepBlock(query);
  const onBlockClick = useCallback(
    (name: string | null): void => {
      setCategoryDeep(name && isAnalysisPage(name) ? name : null);
    },
    [setCategoryDeep],
  );

  const blocksDeep = useMemo(
    () => (costDeep ? getDeepBlocks(getDeepForest(costDeep), width, height) : undefined),
    [costDeep, width, height],
  );

  const [activeBlocks, setActiveBlocks] = useState<BlockName[]>([]);
  const onHover = useCallback((...names: BlockName[]) => setActiveBlocks(names), []);

  const [treeOpen, setTreeOpen] = useState({});

  const activeMain = activeBlocks?.[0];
  const activeSub = activeBlocks?.[1];

  const status = useMemo(() => {
    const activeCost: (GQL<CategoryCostTree> | GQL<CategoryCostTreeDeep>)[] = costDeep ?? cost;
    if (!(activeCost && activeMain)) {
      return '';
    }
    if (activeMain === 'saved') {
      return `Saved: ${formatCurrency(saved, { raw: true })}`;
    }

    const main = activeCost.find(({ item }) => item === activeMain);
    if (!main) {
      return '';
    }
    if (activeSub) {
      const total = main?.tree?.find(({ category }) => category === activeSub)?.sum ?? 0;

      return `${capitalise(activeMain)}: ${activeSub} (${formatCurrency(total, { raw: true })})`;
    }

    const total = main.tree.reduce<number>((last, { sum }) => last + sum, 0);

    return `${capitalise(activeMain)} (${formatCurrency(total, {
      raw: true,
    })})`;
  }, [cost, costDeep, saved, activeMain, activeSub]);

  return (
    <Styled.Page page={PageNonStandard.Analysis}>
      <Upper
        period={query.period}
        groupBy={query.groupBy}
        page={query.page ?? 0}
        description={description ?? ''}
        loading={loading || loadingDeep}
        onRequest={onRequest}
      />
      <Styled.Outer>
        <ListTree
          income={income}
          cost={forest}
          treeVisible={treeVisible}
          toggleTreeItem={toggleTreeItem}
          treeOpen={treeOpen}
          setTreeOpen={setTreeOpen}
          onHover={onHover}
        />
        <BlockPacker
          blocks={blocks}
          blocksDeep={blocksDeep}
          activeBlocks={activeBlocks}
          onHover={onHover}
          onClick={onBlockClick}
          status={status}
        />
      </Styled.Outer>
    </Styled.Page>
  );
};
export default PageAnalysis;
