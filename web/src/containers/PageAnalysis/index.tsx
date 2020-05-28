import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ListTree, { Props as PropsListTree } from './list-tree';
import * as Styled from './styles';
import Timeline from './timeline';
import Upper from './upper';

import { requested, blockRequested, blockReceived } from '~client/actions/analysis';
import { BlockPacker } from '~client/components/BlockPacker';
import { usePersistentState } from '~client/hooks/persist';
import { formatCurrency, capitalise } from '~client/modules/format';
import {
  getAnalysisPeriod,
  getGrouping,
  getPage,
  getCostAnalysis,
  getDeepCost,
  getBlocks,
  getDeepBlocks,
  getTimeline,
  getDescription,
} from '~client/selectors';
import { Page, MainBlockName, AnalysisTreeVisible, FlexBlocks, BlockItem } from '~client/types';

const keyTreeVisible = 'analysis_treeVisible';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateTreeVisible = (value: any | AnalysisTreeVisible): value is AnalysisTreeVisible =>
  value !== null &&
  typeof value === 'object' &&
  Object.entries(value).every(
    ([key, keyValue]) => typeof key === 'string' && typeof keyValue === 'boolean',
  );

const defaultTreeVisible: AnalysisTreeVisible = { [Page.bills]: false };

function useTreeToggle(): [AnalysisTreeVisible, PropsListTree['toggleTreeItem']] {
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

const PageAnalysis: React.FC = () => {
  const timeline = useSelector(getTimeline);
  const cost = useSelector(getCostAnalysis);
  const costDeep = useSelector(getDeepCost);
  const [treeVisible, toggleTreeItem] = useTreeToggle();
  const getFilteredBlocks = useMemo(() => getBlocks(treeVisible), [treeVisible]);
  const blocks: FlexBlocks<BlockItem> = useSelector(getFilteredBlocks);
  const blocksDeep: FlexBlocks<BlockItem> | undefined = useSelector(getDeepBlocks);
  const period = useSelector(getAnalysisPeriod);
  const grouping = useSelector(getGrouping);
  const page = useSelector(getPage);
  const description = useSelector(getDescription);

  const dispatch = useDispatch();
  const onBlockClick = useCallback(
    (name: string | null): void => {
      if (name) {
        dispatch(blockRequested(name));
      } else {
        dispatch(blockReceived(undefined));
      }
    },
    [dispatch],
  );
  const onRequest = useCallback(
    (request?: Partial<{}>): void => {
      dispatch(requested(request));
    },
    [dispatch],
  );

  const [activeBlock, setActiveBlock] = useState<[MainBlockName | null, string | null]>([
    null,
    null,
  ]);
  const onHover = useCallback((main, sub = null) => setActiveBlock([main, sub]), []);
  const [activeMain, activeSub] = activeBlock;

  const [treeOpen, setTreeOpen] = useState({});

  const hasRequested = useRef<boolean>(false);
  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      onRequest();
    }
  }, [cost, onRequest]);

  const status = useMemo(() => {
    const activeCost = costDeep || cost;
    if (!(activeCost && activeMain)) {
      return '';
    }

    const main = activeCost.find(({ name }) => name === activeMain);
    if (!main) {
      return '';
    }
    if (activeSub) {
      const { total } = main?.subTree?.find(({ name }) => name === activeSub) ?? { total: 0 };

      return `${capitalise(activeMain)}: ${activeSub} (${formatCurrency(total, { raw: true })})`;
    }

    return `${capitalise(activeMain)} (${formatCurrency(main.total, {
      raw: true,
    })})`;
  }, [cost, costDeep, activeMain, activeSub]);

  if (!cost) {
    return null;
  }

  return (
    <Styled.Page page={Page.analysis}>
      <Upper
        period={period}
        grouping={grouping}
        page={page}
        description={description ?? ''}
        onRequest={onRequest}
      />
      <Styled.Outer>
        {timeline && <Timeline data={timeline} />}
        <ListTree
          cost={cost}
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

export default PageAnalysis;
