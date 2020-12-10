import { rgba } from 'polished';
import React, { useMemo, useContext } from 'react';
import { useSelector } from 'react-redux';

import { Key } from './key';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { profitLossColor } from '~client/components/graph/helpers';
import { TodayContext } from '~client/hooks';
import { getStartDate, getProcessedCost } from '~client/selectors';
import { colors } from '~client/styled/variables';
import { DrawProps, Line, PageNonStandard } from '~client/types';

function processData(
  startDate: Date,
  net: number[],
  spending: number[],
  savingsRatio: number[],
): Line[] {
  const props: TimeValuesProps = {
    oldOffset: 0,
    startDate,
  };

  return [
    {
      key: 'net',
      data: getValuesWithTime(net, props),
      arrows: true,
      color: profitLossColor,
    },
    {
      key: 'spending',
      data: getValuesWithTime(spending, props),
      fill: false,
      smooth: true,
      color: colors[PageNonStandard.Overview].spending,
    },
    {
      key: 'savingsRatio',
      data: getValuesWithTime(
        savingsRatio.map((value) => value * 1),
        props,
      ),
      color: rgba(colors.green, 0.2),
      secondary: true,
      smooth: true,
      fill: true,
      strokeWidth: 1,
      movingAverage: 12,
    },
  ];
}

export const GraphSpending: React.FC = () => {
  const today = useContext(TodayContext);
  const startDate = useSelector(getStartDate);
  const { net, spending, savingsRatio } = useSelector(getProcessedCost(today));

  const lines = useMemo<Line[]>(() => processData(startDate, net, spending, savingsRatio), [
    startDate,
    net,
    spending,
    savingsRatio,
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

  return (
    <GraphCashFlow dualAxis today={today} name="spend" lines={lines} afterLines={afterLines} />
  );
};
