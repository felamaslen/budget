import groupBy from 'lodash/groupBy';
import moize from 'moize';
import { rgba } from 'polished';
import React, { useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { AfterCanvas, ToggleList } from './after-canvas';
import { BuySellDots } from './buy-sell-dots';
import { hoverEffectByMode } from './labels';
import { getFundLineName } from './name';
import * as Styled from './styles';

import {
  configUpdatedFromLocal,
  errorOpened,
  fundPricesUpdated,
  fundQueryUpdated,
} from '~client/actions';
import { FundWeights } from '~client/components/fund-weights';
import {
  LineGraph,
  LineGraphProps,
  SiblingProps,
  TimeAxes,
  useGraphWidth,
} from '~client/components/graph';
import { useFundModeList } from '~client/components/page-funds/hooks';
import { ErrorLevel } from '~client/constants/error';
import {
  GRAPH_FUNDS_WIDTH,
  GRAPH_FUNDS_HEIGHT,
  GRAPH_FUNDS_OVERALL_ID,
  GRAPH_FUNDS_NUM_TICKS,
} from '~client/constants/graph';
import { TodayContext, usePersistentState } from '~client/hooks';
import { useFundPricesUpdateQuery } from '~client/hooks/gql';
import { lastInArray } from '~client/modules/data';
import { getTickSize } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';
import {
  getAppConfig,
  getFundItems,
  getFundLines,
  getFundsCache,
  getHistoryOptions,
} from '~client/selectors';
import { graphFundsHeightMobile } from '~client/styled/variables';
import type {
  Data,
  DrawProps,
  FundItem,
  FundLine,
  GraphStack,
  HistoryOptions,
  Id,
  Line,
  Padding,
  Point,
  Range,
} from '~client/types';
import { FundMode } from '~client/types/enum';

const PADDING_DESKTOP: Padding = [20, 3, 0, 12];
const PADDING_DESKTOP_WITH_SIDEBAR: Padding = [20, 3, 0, 60];
const PADDING_MOBILE: Padding = [0, 0, 0, 0];

function useDynamicPrices(): [HistoryOptions, (nextQuery: HistoryOptions) => void] {
  const query = useSelector(getHistoryOptions);

  const dispatch = useDispatch();

  const setQuery = useCallback(
    (nextQuery: HistoryOptions): void => {
      dispatch(fundQueryUpdated(nextQuery));
    },
    [dispatch],
  );

  const hasChangedQuery = useRef<boolean>(false);
  const initialQuery = useRef<HistoryOptions>(query);
  useEffect(() => {
    if (query !== initialQuery.current) {
      hasChangedQuery.current = true;
    }
  }, [query]);

  const [res] = useFundPricesUpdateQuery({
    pause: !hasChangedQuery.current,
    variables: query,
    requestPolicy: 'cache-and-network',
  });

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
    filteredFundLines: FundLine[],
    mode: FundMode,
    startTime: number,
    cacheTimes: number[],
  ): Line[] => {
    const sortedLines = filteredFundLines.slice().sort((a, b) => a.id - b.id);

    const initialStack: Data = cacheTimes.map<Point>((time) => [time, 0]);

    type Accumulator = {
      last: Line[];
      idCount: Record<Id, number>;
      stack: GraphStack;
    };

    if (mode === FundMode.Stacked) {
      const groupedLines = groupBy(sortedLines, 'id');

      const result = Object.entries(groupedLines)
        .map<FundLine>(([, group]) =>
          group.reduce<FundLine>(
            (last, next) => ({
              ...last,
              data: last.data.map(([x, y]) => [
                x,
                y + (next.data.find(([time]) => time === x)?.[1] ?? 0),
              ]),
            }),
            { ...group[0], data: initialStack },
          ),
        )
        .reduce<Accumulator>(
          ({ last, idCount, stack }, { id, item, color, data }) => {
            const shouldStack = id !== GRAPH_FUNDS_OVERALL_ID;
            const nextStack = shouldStack
              ? initialStack.map<Point>(([x], index) => [x, data[index][1]])
              : initialStack;

            const filteredStack = shouldStack
              ? stack.map((component) =>
                  component.filter(([x]) => data.some(([time]) => time === x)),
                )
              : undefined;

            const nextLine: Line = {
              key: `${id}-${idCount[id] || 0}`,
              name: getFundLineName(id, item),
              data,
              fill: shouldStack,
              stack: filteredStack,
              color: shouldStack ? rgba(color, 0.75) : color,
              strokeWidth: 1,
              smooth: false,
            };

            return {
              idCount: { ...idCount, [id]: (idCount[id] || 0) + 1 },
              stack: [...stack, nextStack],
              last: [...last, nextLine],
            };
          },
          {
            last: [],
            idCount: {},
            stack: [],
          },
        )
        .last.map<Line>((line) => {
          if (line.name === 'Overall') {
            return line;
          }

          const stackBegin =
            line.stack?.reduce<number>((last, stack) => last + stack[0][1], 0) ?? 0;
          const stackEnd =
            line.stack?.reduce<number>((last, stack) => last + stack[stack.length - 1][1], 0) ?? 0;

          return {
            ...line,
            data: [
              [line.data[0][0], stackBegin],
              ...line.data,
              [line.data[line.data.length - 1][0], stackEnd],
            ],
            stack:
              line.stack?.map((component) => [[line.data[0][0], stackBegin], ...component]) ??
              undefined,
          };
        });

      return result;
    }

    const { last: numberedLines } = sortedLines.reduce<Omit<Accumulator, 'stack'>>(
      ({ last, idCount }, { id, item, color, data }) => {
        const nextLine: Line = {
          key: `${id}-${idCount[id] || 0}`,
          name: getFundLineName(id, item),
          data,
          color,
          strokeWidth: id === GRAPH_FUNDS_OVERALL_ID ? 2 : 1,
          smooth: mode !== FundMode.Value,
        };

        return {
          idCount: { ...idCount, [id]: (idCount[id] || 0) + 1 },
          last: [...last, nextLine],
        };
      },
      {
        last: [],
        idCount: {},
      },
    );

    return numberedLines;
  },
  { maxSize: 1 },
);

const getRanges = moize(
  (lines: Line[], times: number[], mode: FundMode): [Range, number] => {
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
    if (mode !== FundMode.Value) {
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
    if (mode === FundMode.Roi && minY === 0) {
      minY = -maxY * 0.2;
    }

    // get the tick size for the new range
    const tickSize = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);
    if (!tickSize) {
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
  mode: FundMode;
  today: Date;
  toggleList: ToggleList;
}): LineGraphProps {
  const fundLines = useSelector(getFundLines.today(today));
  const { startTime, cacheTimes } = useSelector(getFundsCache);

  const filteredFundLines = useMemo<FundLine[]>(
    () =>
      fundLines[mode].filter(({ id }) =>
        isMobile ? id === GRAPH_FUNDS_OVERALL_ID : toggleList[id] !== false,
      ),
    [fundLines, mode, isMobile, toggleList],
  );
  const lines = filterLines(isMobile, filteredFundLines, mode, startTime, cacheTimes);

  const [ranges, tickSizeY] = getRanges(lines, cacheTimes, mode);

  const labelY = useCallback((value) => formatValue(value, mode), [mode]);

  const BeforeLines = useCallback<React.FC<DrawProps>>(
    (props) => (
      <TimeAxes
        {...props}
        hideMinorTicks
        yAlign="right"
        tickSizeY={tickSizeY}
        labelY={labelY}
        offset={startTime}
      />
    ),
    [startTime, tickSizeY, labelY],
  );

  const AfterLines = useCallback<React.FC<SiblingProps>>(
    (props) =>
      [FundMode.Roi, FundMode.Value].includes(mode) ? (
        <BuySellDots {...props} fundLines={filteredFundLines} startTime={startTime} mode={mode} />
      ) : null,
    [filteredFundLines, startTime, mode],
  );

  return {
    isMobile,
    width,
    height,
    ...ranges,
    BeforeLines,
    AfterLines,
    lines,
    hoverEffect: hoverEffectByMode[mode],
  };
}

export const GraphFunds: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const today = useContext(TodayContext);
  const width = useGraphWidth(GRAPH_FUNDS_WIDTH);
  const height = isMobile ? graphFundsHeightMobile : GRAPH_FUNDS_HEIGHT;

  const dispatch = useDispatch();

  const fundItems = useSelector(getFundItems.today(today));
  const { fundMode: mode } = useSelector(getAppConfig);

  const [historyOptions, setHistoryOptions] = useDynamicPrices();
  const modeList = useFundModeList(isMobile);
  const changeMode = useCallback(
    (newMode: FundMode) => {
      dispatch(configUpdatedFromLocal({ fundMode: newMode }));
    },
    [dispatch],
  );

  const validMode = modeList.includes(mode) ? mode : modeList[0];

  const [sidebarOpen, setSidebarOpen] = usePersistentState<boolean>(false, 'funds_sidebar_open');
  const [toggleList, setToggleList] = useToggleList(fundItems);
  const graphProps = useGraphProps({
    width,
    height,
    isMobile,
    mode: validMode,
    today,
    toggleList,
  });

  return (
    <Styled.Container>
      <Styled.GraphFunds data-testid="graph-funds" width={width} height={height}>
        {graphProps.minX !== graphProps.maxX && (
          <LineGraph {...graphProps} padding={getPadding(isMobile, sidebarOpen)} />
        )}
        <AfterCanvas
          isMobile={isMobile}
          historyOptions={historyOptions}
          mode={validMode}
          changeMode={changeMode}
          fundItems={fundItems}
          toggleList={toggleList}
          setToggleList={setToggleList}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          changePeriod={setHistoryOptions}
        />
      </Styled.GraphFunds>
      {!isMobile && (
        <Styled.GraphFunds width={width} height={height}>
          <FundWeights />
        </Styled.GraphFunds>
      )}
    </Styled.Container>
  );
};
