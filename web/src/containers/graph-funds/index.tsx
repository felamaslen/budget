import fromUnixTime from 'date-fns/fromUnixTime';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as Styled from './styles';

import { fundsRequested } from '~client/actions/funds';

import { ZoomedDimensions, ZoomEffect } from '~client/components/graph/hooks/zoom';
import { LineGraph, Props as LineGraphProps } from '~client/components/graph/line-graph';
import { TimeAxes, LabelY } from '~client/components/graph/time-axes';
import {
  GRAPH_FUNDS_WIDTH,
  GRAPH_FUNDS_HEIGHT,
  GRAPH_FUNDS_OVERALL_ID,
  Mode,
  Period,
  GRAPH_FUNDS_NUM_TICKS,
} from '~client/constants/graph';

import { AfterCanvas } from '~client/containers/graph-funds/after-canvas';

import { rgba } from '~client/modules/color';
import { getTickSize, formatItem } from '~client/modules/format';
import { formatValue } from '~client/modules/funds';

import { getWindowWidth } from '~client/selectors/app';
import {
  getPeriod,
  getStartTime,
  getCacheTimes,
  getFundItems,
  getFundLines,
} from '~client/selectors/funds';

import { graphFundsHeightMobile } from '~client/styled/variables';

import { Padding, Line, DrawProps } from '~client/types';
import { FundLine } from '~client/types/funds';

const PADDING_DESKTOP: Padding = [36, 0, 0, 0];
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

type FilterFunds = (filteredItems: { id: string }) => boolean;

const GraphFunds: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  const windowWidth = useSelector(getWindowWidth);
  const width = Math.min(windowWidth, GRAPH_FUNDS_WIDTH);
  const height = isMobile ? graphFundsHeightMobile : GRAPH_FUNDS_HEIGHT;
  const fundItems = useSelector(getFundItems);
  const fundLines: {
    [mode in Mode]: FundLine[];
  } = useSelector(getFundLines);
  const startTime = useSelector(getStartTime);
  const cacheTimes = useSelector(getCacheTimes);
  const period = useSelector(getPeriod);

  const dispatch = useDispatch();
  const onFundsRequested = useCallback(
    (fromCache: boolean, newPeriod: Period): void => {
      dispatch(fundsRequested(fromCache, newPeriod));
    },
    [dispatch],
  );

  const haveData = cacheTimes.length > 0;

  const modeList = useMemo<Mode[]>(() => {
    if (isMobile) {
      return modeListAll.filter((value) => value !== Mode.Price);
    }

    return modeListAll;
  }, [isMobile]);

  const [mode, setMode] = useState<Mode>(modeList[0]);
  const [toggleList, setToggleList] = useState<{ [id: string]: boolean | null }>({});
  const [numFundItems, setNumFundItems] = useState<number>(0);

  useEffect(() => {
    if (fundItems.length !== numFundItems) {
      setNumFundItems(fundItems.length);

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
  }, [fundItems, numFundItems]);

  const filterFunds = useMemo<FilterFunds>(() => {
    if (isMobile) {
      return ({ id }): boolean => id === GRAPH_FUNDS_OVERALL_ID;
    }

    return ({ id }): boolean => toggleList[id] !== false;
  }, [isMobile, toggleList]);

  const lines = useMemo<Line[]>(() => {
    type Accumulator = [Line[], { [id: string]: number }];
    const [numberedLines] = fundLines[mode].filter(filterFunds).reduce(
      ([last, idCount]: Accumulator, { id, color, data }: FundLine): Accumulator => [
        last.concat([
          {
            key: `${id}-${idCount[id] || 0}`,
            data,
            color: rgba(color),
            strokeWidth: id === GRAPH_FUNDS_OVERALL_ID ? 2 : 1,
            smooth: mode !== Mode.Value,
          },
        ]),
        { ...idCount, [id]: (idCount[id] || 0) + 1 },
      ],
      [[], {}] as Accumulator,
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

  const changePeriod = useCallback((nextPeriod) => onFundsRequested(true, nextPeriod), [
    onFundsRequested,
  ]);

  const beforeLines = useMemo<React.FC<DrawProps>>(() => {
    if (!haveData) {
      return (): null => null;
    }

    return makeBeforeLines({
      startTime,
      tickSizeY,
      labelY,
    });
  }, [haveData, startTime, tickSizeY, labelY]);

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

  const onClick = useCallback(
    () => setMode((last) => modeList[(modeList.indexOf(last) + 1) % modeList.length]),
    [modeList],
  );

  const svgProperties = useMemo(() => ({ onClick }), [onClick]);

  const graphProps: LineGraphProps = {
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

  return (
    <Styled.GraphFunds data-testid="graph-funds" width={width} height={height}>
      <LineGraph {...graphProps} />
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
  );
};

export default GraphFunds;
