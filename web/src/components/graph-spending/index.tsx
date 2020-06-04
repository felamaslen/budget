import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Key } from './key';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { profitLossColor } from '~client/components/graph/helpers';
import { useToday } from '~client/hooks/time';
import { getStartDate, getProcessedCost } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { Page, Line, DrawProps } from '~client/types';

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
      color: colors[Page.overview].spending,
      movingAverage: 6,
    },
  ];
}

export const GraphSpending: React.FC = () => {
  const today = useToday();
  const startDate = useSelector(getStartDate);
  const { net, spending } = useSelector(getProcessedCost(today));

  const lines = useMemo<Line[]>(() => processData(startDate, net, spending), [
    startDate,
    net,
    spending,
  ]);

  const afterLines = useMemo<React.FC<DrawProps>>(() => {
    const AfterLines: React.FC<DrawProps> = ({ pixX, pixY1, maxX, minY, maxY }) => (
      <g>
        <Key
          now={today}
          title="Cash flow"
          pixX={pixX}
          pixY1={pixY1}
          maxX={maxX}
          minY={minY}
          maxY={maxY}
        />
      </g>
    );

    return AfterLines;
  }, [today]);

  return <GraphCashFlow name="spend" lines={lines} afterLines={afterLines} />;
};
