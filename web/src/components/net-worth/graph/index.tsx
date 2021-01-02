import getUnixTime from 'date-fns/getUnixTime';
import React from 'react';

import * as Styled from './styles';
import { LineGraph, TimeAxes, TimeAxesProps, useGraphWidth } from '~client/components/graph';
import { breakpoints } from '~client/styled/variables';
import {
  NetWorthTableRow as TableRow,
  Range,
  DrawProps,
  Line,
  NetWorthTableRow,
  Data,
} from '~client/types';

export type GraphProps = {
  isMobile: boolean;
  table: TableRow[];
};

const makeBeforeLines = (axisProps: Partial<TimeAxesProps> = {}): React.FC<DrawProps> => {
  const BeforeLines: React.FC<DrawProps> = (props) => (
    <TimeAxes {...props} hideMinorTicks dualAxis {...axisProps} />
  );

  return BeforeLines;
};

const BeforeLinesFTI = makeBeforeLines({ labelY: String });
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

export const getFTISeries = (table: NetWorthTableRow[]): Data =>
  table.map(({ date, fti }) => [getUnixTime(date), fti]);

const getDataFti = (table: GraphProps['table']): Line[] => [
  {
    key: 'fti',
    data: getFTISeries(table),
    color: '#000',
    smooth: true,
  },
  {
    key: 'net-worth',
    data: table.map(({ date, assets, liabilities }) => [getUnixTime(date), assets - liabilities]),
    color: Styled.keyColors.assets,
    smooth: true,
    strokeWidth: 1,
    secondary: true,
  },
  {
    key: 'spending',
    data: table.map(({ date, pastYearAverageSpend }) => [getUnixTime(date), pastYearAverageSpend]),
    color: 'red',
    smooth: true,
    strokeWidth: 1,
    secondary: true,
  },
];

const getDataNetWorth = (table: GraphProps['table']): Line[] => [
  {
    key: 'options',
    data: table.map(({ date, assets, options }) => [getUnixTime(date), assets + options]),
    color: Styled.keyColors.options,
    smooth: true,
    dashed: true,
    strokeWidth: 1,
  },
  {
    key: 'assets',
    data: table.map(({ date, assets }) => [getUnixTime(date), assets]),
    color: Styled.keyColors.assets,
    smooth: true,
  },
  {
    key: 'liabilities',
    data: table.map(({ date, liabilities }) => [getUnixTime(date), -liabilities]),
    color: Styled.keyColors.liabilities,
    smooth: true,
    strokeWidth: 1,
    secondary: true,
  },
  {
    key: 'expenses',
    data: table.map(({ date, expenses }) => [getUnixTime(date), -expenses]),
    color: Styled.keyColors.expenses,
    smooth: true,
    strokeWidth: 1,
    secondary: true,
  },
];

export const NetWorthGraph: React.FC<GraphProps> = ({ isMobile, table }) => {
  const dataFti = React.useMemo<Line[]>(() => getDataFti(table), [table]);
  const dataNetWorth = React.useMemo<Line[]>(() => getDataNetWorth(table), [table]);

  const dimensionsNetWorthLeft = dimensions(dataNetWorth.filter(({ secondary }) => secondary));
  const dimensionsNetWorthRight = dimensions(dataNetWorth.filter(({ secondary }) => !secondary));

  const dimensionsFti = dimensions(dataFti.filter(({ secondary }) => !secondary));
  const dimensionsFtiBackground = dimensions(dataFti.filter(({ secondary }) => secondary));

  const graphWidth = useGraphWidth(isMobile ? breakpoints.mobile : 320);
  const graphWidthWithMargin = isMobile ? (graphWidth - 6) / 2 : graphWidth;
  const graphHeightNetWorth = isMobile ? 100 : 240;
  const graphHeightFTI = isMobile ? 100 : 180;

  return (
    <>
      <Styled.GraphSection>
        <Styled.GraphKey>
          <ul>
            <Styled.KeyAssets>
              &mdash; Assets (<Styled.KeyOptions>options</Styled.KeyOptions>)
            </Styled.KeyAssets>
            <Styled.KeyLiabilities>&mdash; Liabilities</Styled.KeyLiabilities>
            <Styled.KeyExpenses>&mdash; Expenses</Styled.KeyExpenses>
          </ul>
        </Styled.GraphKey>
        <LineGraph
          name="net-worth"
          lines={dataNetWorth}
          width={graphWidthWithMargin}
          height={graphHeightNetWorth}
          {...dimensionsNetWorthRight}
          minY={0}
          minY2={dimensionsNetWorthLeft.minY}
          maxY2={dimensionsNetWorthLeft.maxY}
          beforeLines={BeforeLinesNetWorth}
        />
      </Styled.GraphSection>
      <Styled.GraphSection>
        <Styled.GraphKey>
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
        </Styled.GraphKey>
        <LineGraph
          name="fti"
          lines={dataFti}
          width={graphWidthWithMargin}
          height={graphHeightFTI}
          {...dimensionsFti}
          minY={0}
          minY2={0}
          maxY2={dimensionsFtiBackground.maxY}
          beforeLines={BeforeLinesFTI}
        />
      </Styled.GraphSection>
    </>
  );
};
