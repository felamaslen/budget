import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import getUnixTime from 'date-fns/getUnixTime';
import isSameMonth from 'date-fns/isSameMonth';
import React, { useCallback, useMemo } from 'react';

import { LineGraph, LineGraphProps, TimeAxes, useGraphWidth } from '~client/components/graph';
import { NowLine } from '~client/components/graph-cashflow/now-line';
import { GRAPH_HEIGHT, GRAPH_CASHFLOW_PADDING } from '~client/constants/graph';
import { useToday } from '~client/hooks/time';
import { formatCurrency } from '~client/modules/format';
import { PickUnion, Range, DrawProps, Line } from '~client/types';

export type Props = PickUnion<LineGraphProps, 'name' | 'lines' | 'afterLines' | 'after'> & {
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

function getRanges(lines: Line[]): Range {
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
  const now = useToday();
  const graphWidth = useGraphWidth();

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
