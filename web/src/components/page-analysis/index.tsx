import React, { useState, useCallback, useMemo } from 'react';

import {
  getBlocks,
  getForest,
  getDeepBlocks,
  getDeepForest,
  useAnalysisData,
  useAnalysisDeepBlock,
  useBlockDimensions,
  useTreeToggle,
} from './hooks';
import ListTree from './list-tree';
import * as Styled from './styles';
import Timeline from './timeline';
import Upper from './upper';

import { BlockPacker } from '~client/components/block-packer';
import { isAnalysisPage } from '~client/constants/data';
import { formatCurrency, capitalise } from '~client/modules/format';
import {
  CategoryCostTree,
  CategoryCostTreeDeep,
  GQL,
  MainBlockName,
  PageNonStandard,
} from '~client/types';

export const PageAnalysis: React.FC = () => {
  const [query, onRequest, { cost, saved, description, timeline }, loading] = useAnalysisData();

  const [treeVisible, toggleTreeItem] = useTreeToggle();

  const { width, height } = useBlockDimensions();

  const forest = useMemo(() => getForest(cost, saved), [cost, saved]);
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

  const [activeBlock, setActiveBlock] = useState<[MainBlockName | null, string | null]>([
    null,
    null,
  ]);
  const onHover = useCallback((main, sub = null) => setActiveBlock([main, sub]), []);
  const [activeMain, activeSub] = activeBlock;

  const [treeOpen, setTreeOpen] = useState({});

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
        {timeline && <Timeline data={timeline} />}
        <ListTree
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
          activeMain={activeMain}
          activeSub={activeSub}
          onHover={onHover}
          onClick={onBlockClick}
          status={status}
        />
      </Styled.Outer>
    </Styled.Page>
  );
};
