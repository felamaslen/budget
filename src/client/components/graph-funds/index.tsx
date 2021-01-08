import fromUnixTime from 'date-fns/fromUnixTime';
import moize from 'moize';
import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { AfterCanvas, ToggleList } from './after-canvas';
import * as Styled from './styles';

import { errorOpened, fundPricesUpdated, fundQueryUpdated } from '~client/actions';
import { FundWeights } from '~client/components/fund-weights';
import { LineGraph, LineGraphProps, TimeAxes, useGraphWidth } from '~client/components/graph';
import { HoverEffect } from '~client/components/graph/hooks';
import { ErrorLevel } from '~client/constants/error';
import {
  GRAPH_FUNDS_WIDTH,
  GRAPH_FUNDS_HEIGHT,
  GRAPH_FUNDS_OVERALL_ID,
  GRAPH_FUNDS_NUM_TICKS,
  Mode,
} from '~client/constants/graph';
import { TodayContext, usePersistentState, useUpdateEffect } from '~client/hooks';
import { useFundPricesUpdateQuery } from '~client/hooks/gql';
import { lastInArray } from '~client/modules/data';
import { getTickSize, formatItem } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';
import { getFundItems, getFundLines, getFundsCache, getHistoryOptions } from '~client/selectors';
import { graphFundsHeightMobile } from '~client/styled/variables';
import type {
  DrawProps,
  FundItem,
  FundLine,
  HistoryOptions,
  Line,
  Padding,
  Range,
} from '~client/types';

const PADDING_DESKTOP: Padding = [20, 3, 0, 12];
const PADDING_DESKTOP_WITH_SIDEBAR: Padding = [20, 3, 0, 60];
const PADDING_MOBILE: Padding = [0, 0, 0, 0];

const modeList = Object.values(Mode);

function useDynamicPrices(): [HistoryOptions, (nextQuery: HistoryOptions) => void] {
  const query = useSelector(getHistoryOptions);

  const dispatch = useDispatch();

  const setQuery = useCallback(
    (nextQuery: HistoryOptions): void => {
      dispatch(fundQueryUpdated(nextQuery));
    },
    [dispatch],
  );

  const [res, refresh] = useFundPricesUpdateQuery({
    variables: query,
    pause: true,
  });

  useUpdateEffect(() => {
    refresh();
  }, [query, refresh]);

  useEffect(() => {
    if (res.error) {
      dispatch(errorOpened(`Error fetching fund prices: ${res.error.message}`, ErrorLevel.Err));
    }
  }, [dispatch, res.error]);

  useEffect(() => {
    if (res.data?.fundHistory && !res.stale) {
      dispatch(fundPricesUpdated(res.data.fundHistory));
    }
  }, [dispatch, res.data, res.stale]);

  return [query, setQuery];
}

function useToggleList(
  fundItems: FundItem[],
): [ToggleList, React.Dispatch<React.SetStateAction<ToggleList>>] {
  const [toggleList, setToggleList] = useState<ToggleList>({});
  const numFundItems = useRef<number>(0);
  useEffect(() => {
    if (fundItems.length !== numFundItems.current) {
      numFundItems.current = fundItems.length;
      setToggleList((lastList) =>
        fundItems.reduce(
          (last, { id }) => ({
            [id]: true,
            ...last,
          }),
          lastList,
        ),
      );
    }
  }, [fundItems]);

  return [toggleList, setToggleList];
}

const filterLines = moize(
  (
    isMobile: boolean,
    fundLines: Record<Mode, FundLine[]>,
    mode: Mode,
    toggleList: ToggleList,
  ): Line[] => {
    type Accumulator = [Line[], Record<number, number>];
    const [numberedLines] = fundLines[mode]
      .filter(({ id }) => (isMobile ? id === GRAPH_FUNDS_OVERALL_ID : toggleList[id] !== false))
      .reduce<Accumulator>(
        ([last, idCount], { id, color, data }) => [
          [
            ...last,
            {
              key: `${id}-${idCount[id] || 0}`,
              data,
              color,
              strokeWidth: id === GRAPH_FUNDS_OVERALL_ID ? 2 : 1,
              smooth: mode !== Mode.Value,
            },
          ],
          { ...idCount, [id]: (idCount[id] || 0) + 1 },
        ],
        [[], {}],
      );

    return numberedLines;
  },
  { maxSize: 1 },
);

const getRanges = moize(
  (lines: Line[], times: number[], mode: Mode): [Range, number] => {
    if (times.length <= 1) {
      return [
        {
          minX: 0,
          maxX: 0,
          minY: 0,
          maxY: 0,
        },
        0,
      ];
    }

    const maxX = lastInArray(times) ?? 0;

    const valuesY = lines
      .map(({ data }) => data.map(([, yValue]) => yValue))
      .filter((values) => values.length);

    let minY = 0;
    if (mode !== Mode.Value) {
      minY = valuesY.reduce(
        (min, line) =>
          Math.min(
            min,
            line.reduce((last, value) => Math.min(last, value), min),
          ),
        Infinity,
      );
    }
    let maxY = valuesY.reduce(
      (max, line) =>
        Math.max(
          max,
          line.reduce((last, value) => Math.max(last, value), max),
        ),
      -Infinity,
    );

    if (minY === maxY) {
      minY -= 0.5;
      maxY += 0.5;
    }
    if (mode === Mode.ROI && minY === 0) {
      minY = -maxY * 0.2;
    }

    // get the tick size for the new range
    const tickSize = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);

    if (!Number.isNaN(tickSize)) {
      minY = tickSize * Math.floor(minY / tickSize);
      maxY = tickSize * Math.ceil(maxY / tickSize);
    }

    return [
      {
        minX: 0,
        maxX,
        minY,
        maxY,
      },
      tickSize,
    ];
  },
  { maxSize: 1 },
);

const getPadding = moize(
  (isMobile: boolean, sidebarOpen: boolean): Padding => {
    if (isMobile) {
      return PADDING_MOBILE;
    }
    return sidebarOpen ? PADDING_DESKTOP_WITH_SIDEBAR : PADDING_DESKTOP;
  },
  { maxSize: 1 },
);

function useGraphProps({
  width,
  height,
  isMobile,
  mode,
  today,
  toggleList,
}: {
  width: number;
  height: number;
  isMobile: boolean;
  mode: Mode;
  today: Date;
  toggleList: ToggleList;
}): LineGraphProps {
  const fundLines = useSelector(getFundLines.today(today));
  const { startTime, cacheTimes } = useSelector(getFundsCache);

  const selectedMode = isMobile ? Mode.ROI : mode;
  const lines = filterLines(isMobile, fundLines, selectedMode, toggleList);

  const [ranges, tickSizeY] = getRanges(lines, cacheTimes, selectedMode);

  const labelY = useCallback((value) => formatValue(value, selectedMode), [selectedMode]);

  const beforeLines = useMemo(() => {
    const BeforeLines: React.FC<DrawProps> = (props) => (
      <TimeAxes
        {...props}
        hideMinorTicks
        yAlign="right"
        tickSizeY={tickSizeY}
        labelY={labelY}
        offset={startTime}
      />
    );
    return BeforeLines;
  }, [startTime, tickSizeY, labelY]);

  const labelX = useCallback((value) => formatItem('date', fromUnixTime(value + startTime)), [
    startTime,
  ]);

  const hoverEffect = useMemo<HoverEffect>(
    () => ({
      labelX,
      labelY,
      labelWidth: 72,
    }),
    [labelX, labelY],
  );

  return {
    name: 'fund-history',
    isMobile,
    width,
    height,
    ...ranges,
    beforeLines,
    lines,
    hoverEffect,
  };
}

export const GraphFunds: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const today = useContext(TodayContext);
  const width = useGraphWidth(GRAPH_FUNDS_WIDTH);
  const height = isMobile ? graphFundsHeightMobile : GRAPH_FUNDS_HEIGHT;
  const fundItems = useSelector(getFundItems.today(today));

  const [historyOptions, setHistoryOptions] = useDynamicPrices();
  const [mode, changeMode] = usePersistentState<Mode>(modeList[0], 'graph_funds_mode');
  const [sidebarOpen, setSidebarOpen] = usePersistentState<boolean>(false, 'funds_sidebar_open');
  const [toggleList, setToggleList] = useToggleList(fundItems);
  const graphProps = useGraphProps({
    width,
    height,
    isMobile,
    mode,
    today,
    toggleList,
  });

  return (
    <Styled.Container>
      <Styled.GraphFunds data-testid="graph-funds" width={width} height={height}>
        {graphProps.minX !== graphProps.maxX && (
          <LineGraph {...graphProps} padding={getPadding(isMobile, sidebarOpen)} />
        )}
        {!isMobile && (
          <AfterCanvas
            historyOptions={historyOptions}
            modeList={modeList}
            mode={mode}
            changeMode={changeMode}
            fundItems={fundItems}
            toggleList={toggleList}
            setToggleList={setToggleList}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            changePeriod={setHistoryOptions}
          />
        )}
      </Styled.GraphFunds>
      {!isMobile && (
        <Styled.GraphFunds width={width} height={height}>
          <FundWeights />
        </Styled.GraphFunds>
      )}
    </Styled.Container>
  );
};
