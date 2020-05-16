import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';

import { rgba } from '~client/modules/color';
import { profitLossColor } from '~client/components/graph/helpers';
import { COLOR_SPENDING } from '~client/constants/colors';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { Key } from '~client/components/graph-spending/key';
import { getStartDate, getProcessedCost } from '~client/selectors';
import { Line, BasicProps } from '~client/types/graph';

function processData(startDate: Date, net: number[], spending: number[]): Line[] {
  const props: TimeValuesProps = {
    oldOffset: 0,
    startDate,
  };

  const dataNet = getValuesWithTime(net, props);
  const dataSpending = getValuesWithTime(spending, props);

  return [
    {
      key: 'net',
      data: dataNet,
      arrows: true,
      color: profitLossColor,
    },
    {
      key: 'spending',
      data: dataSpending,
      fill: false,
      smooth: true,
      color: rgba(COLOR_SPENDING),
      movingAverage: 6,
    },
  ];
}

export const GraphSpending: React.FC = () => {
  const startDate: Date = useSelector(getStartDate);
  const { net, spending } = useSelector(getProcessedCost);

  const lines = useMemo<Line[]>(() => processData(startDate, net, spending), [
    startDate,
    net,
    spending,
  ]);

  const afterLines = useMemo<React.FC<BasicProps>>(() => {
    const AfterLines: React.FC<BasicProps> = ({ pixX, pixY1, maxX, minY, maxY }) => (
      <g>
        <Key title="Cash flow" pixX={pixX} pixY1={pixY1} maxX={maxX} minY={minY} maxY={maxY} />
      </g>
    );

    return AfterLines;
  }, []);

  return <GraphCashFlow name="spend" lines={lines} afterLines={afterLines} />;
};
