import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getUnixTime from 'date-fns/getUnixTime';
import isSameMonth from 'date-fns/isSameMonth';
import React, { useCallback, useMemo } from 'react';

import { hoverEffect } from './labels';
import { LineGraph, LineGraphProps, TimeAxes, useGraphWidth } from '~client/components/graph';
import { NowLine } from '~client/components/graph-cashflow/now-line';
import { getDataX, getStackedDataY } from '~client/components/graph/helpers';
import { GRAPH_HEIGHT, GRAPH_CASHFLOW_PADDING } from '~client/constants/graph';
import { formatPercent } from '~client/modules/format';
import type { PickUnion, Range, DrawProps, Line } from '~client/types';

export type Props = PickUnion<LineGraphProps, 'lines' | 'AfterLines' | 'After'> & {
  isMobile?: boolean;
  today: Date;
  graphHeight?: number;
  dualAxis?: boolean;
  minY2?: number;
  maxY2?: number;
};

function getTimeAtIndex(
  index: number,
  startDate: Date,
  now?: Date,
  breakAtToday?: boolean,
): number {
  const date = endOfMonth(addMonths(startDate, index));
  return getUnixTime(breakAtToday && now && isSameMonth(now, date) ? now : date);
}

export type TimeValuesProps = {
  now?: Date;
  breakAtToday?: boolean;
  startDate: Date;
};

export const getValuesWithTime = (
  data: number[],
  { now, breakAtToday, startDate }: TimeValuesProps,
): [number, number][] =>
  data.map((value, index) => [getTimeAtIndex(index, startDate, now, breakAtToday), value]);

function getRanges(lines: Line[], minY2Initial = 0, maxY2Initial = -Infinity): Range {
  return lines.reduce(
    ({ minX, maxX, minY, maxY, minY2, maxY2 }, { data, stack, secondary }) => {
      const dataX = getDataX(data);
      const dataY = getStackedDataY(data, stack);

      const dataMinY = dataY.reduce((min, value) => Math.min(min, value), Infinity);
      const dataMaxY = dataY.reduce((max, value) => Math.max(max, value), -Infinity);

      return {
        minX: dataX.reduce((min, value) => Math.min(min, value), minX),
        maxX: dataX.reduce((max, value) => Math.max(max, value), maxX),
        minY: secondary ? minY : Math.min(minY, dataMinY),
        maxY: secondary ? maxY : Math.max(maxY, dataMaxY),
        minY2: secondary ? Math.min(minY2, dataMinY) : minY2,
        maxY2: secondary ? Math.max(maxY2, dataMaxY) : maxY2,
      };
    },
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: 0,
      maxY: -Infinity,
      minY2: minY2Initial,
      maxY2: maxY2Initial,
    },
  );
}

const labelY2 = formatPercent;

export const GraphCashFlow: React.FC<Props> = ({
  isMobile = false,
  today,
  graphHeight = GRAPH_HEIGHT,
  lines,
  AfterLines,
  After,
  dualAxis = false,
  minY2,
  maxY2,
}) => {
  const graphWidth = useGraphWidth();
  const ranges = useMemo<Range>(() => getRanges(lines, minY2, maxY2), [lines, minY2, maxY2]);

  const BeforeLines = useCallback<React.FC<DrawProps>>(
    (props) => (
      <g>
        <TimeAxes {...props} dualAxis={dualAxis} labelY2={labelY2} />
        <NowLine now={today} {...props} />
      </g>
    ),
    [dualAxis, today],
  );

  return (
    <LineGraph
      isMobile={isMobile}
      BeforeLines={BeforeLines}
      AfterLines={AfterLines}
      After={After}
      lines={lines}
      hoverEffect={hoverEffect}
      width={graphWidth}
      height={graphHeight}
      padding={GRAPH_CASHFLOW_PADDING}
      y2Capped={true}
      {...ranges}
    />
  );
};
