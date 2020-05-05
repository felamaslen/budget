import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import memoize from 'memoize-one';
import { debounce } from 'throttle-debounce';

import { requested, blockRequested, treeItemDisplayToggled } from '~client/actions/analysis';

import {
  getPeriod,
  getGrouping,
  getPage,
  getTreeVisible,
  getCost,
  getDeepCost,
  getBlocks,
  getDeepBlocks,
  getTimeline,
  getDescription,
} from '~client/selectors/analysis';

import { formatCurrency, capitalise } from '~client/modules/format';

import Timeline from '~client/containers/PageAnalysis/timeline';
import Upper from '~client/containers/PageAnalysis/upper';
import ListTree, { Props as PropsListTree } from '~client/containers/PageAnalysis/list-tree';
import BlockPacker from '~client/components/BlockPacker';

import * as Styled from './styles';
import { MainBlockName } from './types';
import { Page } from '~client/types/app';
import { TreeVisible } from '~client/reducers/analysis';

const keyTreeVisible = 'analysis_treeVisible';

const treeEnabled = (value: boolean | undefined): boolean | undefined =>
  typeof value === 'undefined' ? undefined : !!value;

const makeCachedTreeVisible = (treeVisible: TreeVisible): TreeVisible => ({
  [Page.bills]: treeEnabled(treeVisible[Page.bills]),
  [Page.food]: treeEnabled(treeVisible[Page.food]),
  [Page.general]: treeEnabled(treeVisible[Page.general]),
  [Page.holiday]: treeEnabled(treeVisible[Page.holiday]),
  [Page.social]: treeEnabled(treeVisible[Page.social]),
  saved: treeEnabled(treeVisible.saved),
});

const getCachedTreeVisible = memoize((): TreeVisible | null => {
  try {
    const item = JSON.parse(localStorage.getItem(keyTreeVisible) ?? '{}');
    if (!(item && typeof item === 'object')) {
      return null;
    }
    return makeCachedTreeVisible(item as TreeVisible);
  } catch {
    return null;
  }
});

const setCachedTreeVisible = debounce(100, (treeVisible: TreeVisible): void => {
  localStorage.setItem(keyTreeVisible, JSON.stringify(makeCachedTreeVisible(treeVisible)));
});

function useTreeToggle(
  dispatch: Dispatch<{ type: string }>,
): [TreeVisible, PropsListTree['toggleTreeItem']] {
  const treeVisible = useSelector(getTreeVisible);
  const toggleTreeItem = useCallback(
    (name: MainBlockName): void => {
      dispatch(treeItemDisplayToggled(name));
    },
    [dispatch],
  );

  const cachedTreeVisible = useMemo<TreeVisible | null>(getCachedTreeVisible, []);
  const cacheLoaded = useRef<boolean>(false);

  useEffect(() => {
    if (cacheLoaded.current) {
      setCachedTreeVisible(treeVisible);
    } else {
      cacheLoaded.current = true;

      if (cachedTreeVisible) {
        (Object.keys(cachedTreeVisible) as (keyof TreeVisible)[])
          .filter(
            key =>
              typeof cachedTreeVisible[key] !== 'undefined' &&
              cachedTreeVisible[key] !== (treeVisible[key] !== false),
          )
          .forEach(key => {
            toggleTreeItem(key);
          });
      }
    }
  }, [cachedTreeVisible, treeVisible, toggleTreeItem]);

  return [treeVisible, toggleTreeItem];
}

const PageAnalysis: React.FC = () => {
  const timeline = useSelector(getTimeline);
  const cost = useSelector(getCost);
  const costDeep = useSelector(getDeepCost);
  const blocks = useSelector(getBlocks);
  const blocksDeep = useSelector(getDeepBlocks);
  const period = useSelector(getPeriod);
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
