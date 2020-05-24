import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import getUnixTime from 'date-fns/getUnixTime';
import isSameMonth from 'date-fns/isSameMonth';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { NowLine } from '~client/components/graph-cashflow/now-line';
import { LineGraph, Props as GraphProps } from '~client/components/graph/line-graph';
import { TimeAxes } from '~client/components/graph/time-axes';
import { GRAPH_HEIGHT, GRAPH_CASHFLOW_PADDING } from '~client/constants/graph';
import { formatCurrency } from '~client/modules/format';
import { getCurrentDate, getGraphWidth } from '~client/selectors';
import { PickUnion, Range, DrawProps, Line } from '~client/types';

export type Props = PickUnion<GraphProps, 'name' | 'lines' | 'afterLines' | 'after'> & {
  isMobile?: boolean;
  graphHeight?: number;
};

function getTimeAtIndex(
  index: number,
  offset: number,
  startDate: Date,
  now?: Date,
  breakAtToday?: boolean,
): number {
  const date = endOfMonth(addMonths(startDate, index - offset));
  return getUnixTime(breakAtToday && now && isSameMonth(now, date) ? now : date);
}

export type TimeValuesProps = {
  now?: Date;
  oldOffset: number;
  breakAtToday?: boolean;
  startDate: Date;
};

export const getValuesWithTime = (
  data: number[],
  { now, oldOffset, breakAtToday, startDate }: TimeValuesProps,
): [number, number][] =>
  data.map((value, index) => [
    getTimeAtIndex(index, oldOffset, startDate, now, breakAtToday),
    value,
  ]);

export function getRanges(lines: Line[]): Range {
  return lines.reduce(
    ({ minX, maxX, minY, maxY }, { data, stack }) => {
      const dataX = data.map(([xValue]) => xValue);
      const dataY = data.map(([, yValue], index) => yValue + (stack?.[index]?.[1] ?? 0));

      return {
        minX: dataX.reduce((min, value) => Math.min(min, value), minX),
        maxX: dataX.reduce((max, value) => Math.max(max, value), maxX),
        minY: dataY.reduce((min, value) => Math.min(min, value), minY),
        maxY: dataY.reduce((max, value) => Math.max(max, value), maxY),
      };
    },
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: 0,
      maxY: -Infinity,
    },
  );
}

function makeBeforeLines(now: Date): React.FC<DrawProps> {
  const BeforeLines: React.FC<DrawProps> = (props) => (
    <g>
      <TimeAxes {...props} />
      <NowLine now={now} {...props} />
    </g>
  );

  return BeforeLines;
}

export const GraphCashFlow: React.FC<Props> = ({
  name,
  isMobile = false,
  graphHeight = GRAPH_HEIGHT,
  lines,
  afterLines,
  after,
}) => {
  const now: Date = useSelector(getCurrentDate);
  const graphWidth: number = useSelector(getGraphWidth);

  const ranges = useMemo<Range>(() => getRanges(lines), [lines]);

  const beforeLines = useMemo(() => makeBeforeLines(now), [now]);

  const labelX = useCallback(
    (value: number): string => format(fromUnixTime(value), 'MMM yyyy'),
    [],
  );

  const labelY = useCallback((value) => formatCurrency(value, { precision: 2 }), []);

  const hoverEffect = useMemo(
    () => ({
      labelX,
      labelY,
      labelWidthY: 88,
    }),
    [labelX, labelY],
  );

  const graphProps = {
    name,
    isMobile,
    beforeLines,
    afterLines,
    after,
    lines,
    hoverEffect,
    width: graphWidth,
    height: graphHeight,
    padding: GRAPH_CASHFLOW_PADDING,
    ...ranges,
  };

  return <LineGraph {...graphProps} />;
};
