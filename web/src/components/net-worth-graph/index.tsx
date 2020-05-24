import getUnixTime from 'date-fns/getUnixTime';
import React from 'react';

import * as Styled from './styles';
import { LineGraph } from '~client/components/graph/line-graph';
import { TimeAxes, Props as TimeAxesProps } from '~client/components/graph/time-axes';
import { NetWorthTableRow as TableRow, Range, DrawProps, Line } from '~client/types';

export type GraphProps = {
  table: TableRow[];
};

const labelY = (value: number): string => String(value);

const makeBeforeLines = (axisProps: Partial<TimeAxesProps> = {}): React.FC<DrawProps> => {
  const BeforeLines: React.FC<DrawProps> = (props) => (
    <TimeAxes {...props} yAlign="right" hideMinorTicks dualAxis {...axisProps} />
  );

  return BeforeLines;
};

const BeforeLinesFTI = makeBeforeLines({ labelY });
const BeforeLinesNetWorth = makeBeforeLines();

const dimensions = (lines: Line[]): Range => ({
  minX: lines.reduce(
    (last, { data }) => data.reduce((lineLast, [value]) => Math.min(lineLast, value), last),
    Infinity,
  ),
  maxX: lines.reduce(
    (last, { data }) => data.reduce((lineLast, [value]) => Math.max(lineLast, value), last),
    -Infinity,
  ),
  minY: lines.reduce(
    (last, { data }) => data.reduce((lineLast, [, value]) => Math.min(lineLast, value), last),
    Infinity,
  ),
  maxY: lines.reduce(
    (last, { data }) => data.reduce((lineLast, [, value]) => Math.max(lineLast, value), last),
    -Infinity,
  ),
});

const graphWidth = 320;

export const NetWorthGraph: React.FC<GraphProps> = ({ table }) => {
  const dataFti = React.useMemo<Line[]>(
    () => [
      {
        key: 'fti',
        data: table.map(({ date, fti }) => [getUnixTime(date), fti]),
        color: '#000',
        smooth: true,
      },
      {
        key: 'net-worth',
        data: table.map(({ date, assets, liabilities }) => [
          getUnixTime(date),
          assets - liabilities,
        ]),
        color: 'darkgreen',
        smooth: true,
        strokeWidth: 1,
        secondary: true,
      },
      {
        key: 'spending',
        data: table.map(({ date, pastYearAverageSpend }) => [
          getUnixTime(date),
          pastYearAverageSpend,
        ]),
        color: 'red',
        smooth: true,
        strokeWidth: 1,
        secondary: true,
      },
    ],
    [table],
  );

  const dataNetWorth = React.useMemo<Line[]>(
    () => [
      {
        key: 'options',
        data: table.map(({ date, assets, options }) => [getUnixTime(date), assets + options]),
        color: Styled.colors.options,
        smooth: true,
        dashed: true,
        strokeWidth: 1,
      },
      {
        key: 'assets',
        data: table.map(({ date, assets }) => [getUnixTime(date), assets]),
        color: Styled.colors.assets,
        smooth: true,
      },
      {
        key: 'liabilities',
        data: table.map(({ date, liabilities }) => [getUnixTime(date), -liabilities]),
        color: Styled.colors.liabilities,
        smooth: true,
        strokeWidth: 1,
        secondary: true,
      },
      {
        key: 'expenses',
        data: table.map(({ date, expenses }) => [getUnixTime(date), -expenses]),
        color: Styled.colors.expenses,
        smooth: true,
        strokeWidth: 1,
        secondary: true,
      },
    ],
    [table],
  );

  const dimensionsNetWorthLeft = dimensions(dataNetWorth.filter(({ secondary }) => secondary));
  const dimensionsNetWorthRight = dimensions(dataNetWorth.filter(({ secondary }) => !secondary));

  const dimensionsFti = dimensions(dataFti.filter(({ secondary }) => !secondary));
  const dimensionsFtiBackground = dimensions(dataFti.filter(({ secondary }) => secondary));

  return (
    <>
      <Styled.GraphKey>
        <ul>
          <Styled.KeyAssets>
            &mdash; Assets (<Styled.KeyOptions>incl. options</Styled.KeyOptions>)
          </Styled.KeyAssets>
          <Styled.KeyLiabilities>&mdash; Liabilities</Styled.KeyLiabilities>
          <Styled.KeyExpenses>&mdash; Expenses</Styled.KeyExpenses>
        </ul>
      </Styled.GraphKey>
      <LineGraph
        name="net-worth"
        lines={dataNetWorth}
        width={graphWidth}
        height={240}
        {...dimensionsNetWorthRight}
        minY={0}
        minY2={dimensionsNetWorthLeft.minY}
        maxY2={dimensionsNetWorthLeft.maxY}
        beforeLines={BeforeLinesNetWorth}
      />
      <Styled.FTILabel>
        FTI
        <Styled.FTIFormula>
          <Styled.FTIEquals>=</Styled.FTIEquals>
          <Styled.FTIFraction>
            <Styled.FTIFormulaNumerator>Net worth &times; Age</Styled.FTIFormulaNumerator>
            <Styled.FTIFormulaDenominator>Expenses</Styled.FTIFormulaDenominator>
          </Styled.FTIFraction>
        </Styled.FTIFormula>
      </Styled.FTILabel>
      <LineGraph
        name="fti"
        lines={dataFti}
        width={graphWidth}
        height={180}
        {...dimensionsFti}
        minY={0}
        minY2={0}
        maxY2={dimensionsFtiBackground.maxY}
        beforeLines={BeforeLinesFTI}
      />
    </>
  );
};
