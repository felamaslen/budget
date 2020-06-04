import React, { useState, useCallback, useMemo, useEffect, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ListTree, { Props as PropsListTree } from './list-tree';
import * as Styled from './styles';
import Timeline from './timeline';
import Upper from './upper';

import { analysisRequested, blockRequested, blockReceived } from '~client/actions';
import { BlockPacker, statusHeight } from '~client/components/block-packer';
import {
  ANALYSIS_VIEW_WIDTH,
  ANALYSIS_VIEW_HEIGHT,
  Period,
  Grouping,
} from '~client/constants/analysis';
import { usePersistentState, ResizeContext, useMediaQuery } from '~client/hooks';
import { formatCurrency, capitalise } from '~client/modules/format';
import {
  getAnalysisPeriod,
  getAnalysisGrouping,
  getAnalysisPage,
  getCostAnalysis,
  getDeepCost,
  getBlocks,
  getDeepBlocks,
  getAnalysisTimeline,
  getAnalysisDescription,
} from '~client/selectors';
import { breakpointBase } from '~client/styled/mixins';
import { breakpoints } from '~client/styled/variables';
import { Page, MainBlockName, AnalysisTreeVisible, FlexBlocks, BlockItem } from '~client/types';

const keyTreeVisible = 'analysis_treeVisible';
const keyState = 'analysis_state';

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

function useBlockDimensions(): { width: number; height: number } {
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

type AnalysisState = { period: Period; grouping: Grouping; page: number };
const defaultState: AnalysisState = { period: Period.year, grouping: Grouping.category, page: 0 };

function usePersistentAnalysisState(
  onRequest: (nextState: Partial<AnalysisState>) => void,
): AnalysisState {
  const period = useSelector(getAnalysisPeriod);
  const grouping = useSelector(getAnalysisGrouping);
  const page = useSelector(getAnalysisPage);

  const [persistentState, setPersistentState] = usePersistentState<AnalysisState>(
    defaultState,
    keyState,
  );
  const loadedFromPersistent = useRef<boolean>(false);
  useEffect(() => {
    if (!loadedFromPersistent.current) {
      loadedFromPersistent.current = true;
      onRequest(persistentState);
    }
  }, [persistentState, onRequest]);

  useEffect(() => {
    setPersistentState({ period, grouping, page });
  }, [setPersistentState, period, grouping, page]);

  return { period, grouping, page };
}

export const PageAnalysis: React.FC = () => {
  const timeline = useSelector(getAnalysisTimeline);
  const cost = useSelector(getCostAnalysis);
  const costDeep = useSelector(getDeepCost);
  const [treeVisible, toggleTreeItem] = useTreeToggle();
  const { width, height } = useBlockDimensions();
  const getFilteredBlocks = useMemo(() => getBlocks(width, height, treeVisible), [
    width,
    height,
    treeVisible,
  ]);
  const blocks: FlexBlocks<BlockItem> = useSelector(getFilteredBlocks);

  const getSizedDeepBlocks = useMemo(() => getDeepBlocks(width, height), [width, height]);
  const blocksDeep: FlexBlocks<BlockItem> | undefined = useSelector(getSizedDeepBlocks);
  const description = useSelector(getAnalysisDescription);

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
    (request?: Partial<AnalysisState>): void => {
      dispatch(analysisRequested(request));
    },
    [dispatch],
  );

  const { period, grouping, page } = usePersistentAnalysisState(onRequest);

  const [activeBlock, setActiveBlock] = useState<[MainBlockName | null, string | null]>([
    null,
    null,
  ]);
  const onHover = useCallback((main, sub = null) => setActiveBlock([main, sub]), []);
  const [activeMain, activeSub] = activeBlock;

  const [treeOpen, setTreeOpen] = useState({});

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
