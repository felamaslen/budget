import fromUnixTime from 'date-fns/fromUnixTime';
import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { AfterCanvas } from './after-canvas';
import * as Styled from './styles';
import { fundsRequested } from '~client/actions';
import { FundWeights } from '~client/components/fund-weights';
import {
  LineGraph,
  LineGraphProps,
  ZoomedDimensions,
  ZoomEffect,
  TimeAxes,
  LabelY,
  useGraphWidth,
} from '~client/components/graph';
import {
  GRAPH_FUNDS_WIDTH,
  GRAPH_FUNDS_HEIGHT,
  GRAPH_FUNDS_OVERALL_ID,
  Mode,
  Period,
  GRAPH_FUNDS_NUM_TICKS,
} from '~client/constants/graph';
import { TodayContext } from '~client/hooks';
import { getTickSize, formatItem } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';

import {
  getPeriod,
  getStartTime,
  getCacheTimes,
  getFundItems,
  getFundLines,
} from '~client/selectors';

import { graphFundsHeightMobile } from '~client/styled/variables';
import { Padding, Line, DrawProps, FundLine, FundItem, Id } from '~client/types';

const PADDING_DESKTOP: Padding = [36, 3, 0, 0];
const PADDING_MOBILE: Padding = [0, 0, 0, 0];

const makeGetRanges = ({
  mode,
  zoomRange: [zoomMin, zoomMax],
  lines,
  cacheTimes,
}: {
  mode: Mode;
  zoomRange: [number, number];
  lines: Line[];
  cacheTimes: number[];
}): ZoomEffect => (zoomedLines = lines, minX = zoomMin, maxX = zoomMax): ZoomedDimensions => {
  if (!(zoomedLines && cacheTimes.length >= 2)) {
    return {
      minX,
      maxX,
      minY: -1,
      maxY: 1,
    };
  }

  const valuesY = zoomedLines
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
  const tickSizeY = getTickSize(minY, maxY, GRAPH_FUNDS_NUM_TICKS);

  if (!Number.isNaN(tickSizeY)) {
    minY = tickSizeY * Math.floor(minY / tickSizeY);
    maxY = tickSizeY * Math.ceil(maxY / tickSizeY);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
    tickSizeY,
  };
};

function makeBeforeLines({
  startTime,
  tickSizeY,
  labelY,
}: {
  startTime: number;
  tickSizeY?: number;
  labelY: LabelY;
}): React.FC<DrawProps> {
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
}

const modeListAll: Mode[] = [Mode.ROI, Mode.Value, Mode.Price];

function useMode(isMobile: boolean): [Mode, () => void] {
  const modeList = useMemo<Mode[]>(() => {
    if (isMobile) {
      return modeListAll.filter((value) => value !== Mode.Price);
    }

    return modeListAll;
  }, [isMobile]);

  const [mode, setMode] = useState<Mode>(modeList[0]);

  const switchMode = useCallback(
    () => setMode((last) => modeList[(modeList.indexOf(last) + 1) % modeList.length]),
    [modeList],
  );

  return [mode, switchMode];
}

type FilterFunds = (filteredItems: { id: Id }) => boolean;

function usePeriod(): [Period, (nextPeriod: Period) => void] {
  const period = useSelector(getPeriod);
  const dispatch = useDispatch();
  const onFundsRequested = useCallback(
    (fromCache: boolean, newPeriod: Period): void => {
      dispatch(fundsRequested(fromCache, newPeriod));
    },
    [dispatch],
  );

  const changePeriod = useCallback((nextPeriod) => onFundsRequested(true, nextPeriod), [
    onFundsRequested,
  ]);

  return [period, changePeriod];
}

type ToggleList = { [id: number]: boolean | null };

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

function useGraphProps({
  width,
  height,
  isMobile,
  mode,
  today,
  changeMode,
  toggleList,
}: {
  width: number;
  height: number;
  isMobile: boolean;
  mode: Mode;
  today: Date;
  changeMode: () => void;
  toggleList: ToggleList;
}): LineGraphProps {
  const fundLines: {
    [mode in Mode]: FundLine[];
  } = useSelector(getFundLines(today));

  const startTime = useSelector(getStartTime);
  const cacheTimes = useSelector(getCacheTimes);
  const haveData = cacheTimes.length > 0;

  const filterFunds = useMemo<FilterFunds>(
    () =>
      isMobile
        ? ({ id }): boolean => id === GRAPH_FUNDS_OVERALL_ID
        : ({ id }): boolean => toggleList[id] !== false,
    [isMobile, toggleList],
  );

  const lines = useMemo<Line[]>(() => {
    type Accumulator = [Line[], { [id: number]: number }];
    const [numberedLines] = fundLines[mode].filter(filterFunds).reduce<Accumulator>(
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
  }, [fundLines, mode, filterFunds]);

  const getRanges = useMemo<ZoomEffect>(() => {
    if (!haveData) {
      return (): ZoomedDimensions => ({
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
        tickSizeY: 0,
      });
    }

    return makeGetRanges({
      mode,
      zoomRange: [0, cacheTimes[cacheTimes.length - 1]],
      lines,
      cacheTimes,
    });
  }, [haveData, mode, cacheTimes, lines]);

  const { minX, maxX, minY, maxY, tickSizeY } = useMemo<ZoomedDimensions>(getRanges, [getRanges]);

  const labelY = useCallback((value) => formatValue(value, mode), [mode]);

  const beforeLines = useMemo<React.FC<DrawProps>>(
    () =>
      haveData
        ? makeBeforeLines({
            startTime,
            tickSizeY,
            labelY,
          })
        : (): null => null,
    [haveData, startTime, tickSizeY, labelY],
  );

  const labelX = useCallback((value) => formatItem('date', fromUnixTime(value + startTime)), [
    startTime,
  ]);

  const hoverEffect = useMemo(
    () => ({
      labelX,
      labelY,
    }),
    [labelX, labelY],
  );

  const svgProperties = useMemo(() => ({ onClick: changeMode }), [changeMode]);

  return {
    name: 'fund-history',
    isMobile,
    width,
    height,
    padding: isMobile ? PADDING_MOBILE : PADDING_DESKTOP,
    minX,
    maxX,
    minY,
    maxY,
    beforeLines,
    lines,
    svgProperties,
    hoverEffect,
    zoomEffect: getRanges,
  };
}

export const GraphFunds: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const today = useContext(TodayContext);
  const width = useGraphWidth(GRAPH_FUNDS_WIDTH);
  const height = isMobile ? graphFundsHeightMobile : GRAPH_FUNDS_HEIGHT;
  const fundItems = useSelector(getFundItems(today));

  const [period, changePeriod] = usePeriod();
  const [mode, changeMode] = useMode(isMobile);
  const [toggleList, setToggleList] = useToggleList(fundItems);
  const graphProps = useGraphProps({
    width,
    height,
    isMobile,
    mode,
    today,
    changeMode,
    toggleList,
  });

  return (
    <Styled.Container>
      <Styled.GraphFunds data-testid="graph-funds" width={width} height={height}>
        {graphProps.minX !== graphProps.maxX && <LineGraph {...graphProps} />}
        <AfterCanvas
          isMobile={isMobile}
          period={period}
          mode={mode}
          fundItems={fundItems}
          toggleList={toggleList}
          setToggleList={setToggleList}
          changePeriod={changePeriod}
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
