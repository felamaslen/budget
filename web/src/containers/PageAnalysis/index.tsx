import moize from 'moize';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { debounce } from 'throttle-debounce';

import ListTree, { Props as PropsListTree } from './list-tree';
import * as Styled from './styles';
import Timeline from './timeline';
import Upper from './upper';

import { requested, blockRequested, treeItemDisplayToggled } from '~client/actions/analysis';
import BlockPacker from '~client/components/BlockPacker';
import { formatCurrency, capitalise } from '~client/modules/format';
import {
  getAnalysisPeriod,
  getGrouping,
  getPage,
  getTreeVisible,
  getCostAnalysis,
  getDeepCost,
  getBlocks,
  getDeepBlocks,
  getTimeline,
  getDescription,
} from '~client/selectors';
import { Page, MainBlockName, AnalysisTreeVisible } from '~client/types';

const keyTreeVisible = 'analysis_treeVisible';

const treeEnabled = (value: boolean | undefined): boolean | undefined =>
  typeof value === 'undefined' ? undefined : !!value;

const makeCachedTreeVisible = (treeVisible: AnalysisTreeVisible): AnalysisTreeVisible => ({
  [Page.bills]: treeEnabled(treeVisible[Page.bills]),
  [Page.food]: treeEnabled(treeVisible[Page.food]),
  [Page.general]: treeEnabled(treeVisible[Page.general]),
  [Page.holiday]: treeEnabled(treeVisible[Page.holiday]),
  [Page.social]: treeEnabled(treeVisible[Page.social]),
  saved: treeEnabled(treeVisible.saved),
});

const getCachedTreeVisible = moize((): AnalysisTreeVisible | null => {
  try {
    const item = JSON.parse(localStorage.getItem(keyTreeVisible) ?? '{}');
    if (!(item && typeof item === 'object')) {
      return null;
    }
    return makeCachedTreeVisible(item as AnalysisTreeVisible);
  } catch {
    return null;
  }
});

const setCachedTreeVisible = debounce(100, (treeVisible: AnalysisTreeVisible): void => {
  localStorage.setItem(keyTreeVisible, JSON.stringify(makeCachedTreeVisible(treeVisible)));
});

function useTreeToggle(
  dispatch: Dispatch<{ type: string }>,
): [AnalysisTreeVisible, PropsListTree['toggleTreeItem']] {
  const treeVisible = useSelector(getTreeVisible);
  const toggleTreeItem = useCallback(
    (name: MainBlockName): void => {
      dispatch(treeItemDisplayToggled(name));
    },
    [dispatch],
  );

  const cachedTreeVisible = useMemo<AnalysisTreeVisible | null>(getCachedTreeVisible, []);
  const cacheLoaded = useRef<boolean>(false);

  useEffect(() => {
    if (cacheLoaded.current) {
      setCachedTreeVisible(treeVisible);
    } else {
      cacheLoaded.current = true;

      if (cachedTreeVisible) {
        (Object.keys(cachedTreeVisible) as (keyof AnalysisTreeVisible)[])
          .filter(
            (key) =>
              typeof cachedTreeVisible[key] !== 'undefined' &&
              cachedTreeVisible[key] !== (treeVisible[key] !== false),
          )
          .forEach((key) => {
            toggleTreeItem(key);
          });
      }
    }
  }, [cachedTreeVisible, treeVisible, toggleTreeItem]);

  return [treeVisible, toggleTreeItem];
}

const PageAnalysis: React.FC = () => {
  const timeline = useSelector(getTimeline);
  const cost = useSelector(getCostAnalysis);
  const costDeep = useSelector(getDeepCost);
  const blocks = useSelector(getBlocks);
  const blocksDeep = useSelector(getDeepBlocks);
  const period = useSelector(getAnalysisPeriod);
  const grouping = useSelector(getGrouping);
  const page = useSelector(getPage);
  const description = useSelector(getDescription);

  const dispatch = useDispatch();
  const onBlockClick = useCallback(
    (name: string): void => {
      dispatch(blockRequested(name));
    },
    [dispatch],
  );
  const onRequest = useCallback(
    (request?: Partial<{}>): void => {
      dispatch(requested(request));
    },
    [dispatch],
  );

  const [treeVisible, toggleTreeItem] = useTreeToggle(dispatch);

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
