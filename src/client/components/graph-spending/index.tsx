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
import { getProcessedMonthlyValues, getStartDate } from '~client/selectors';
import { colors } from '~client/styled/variables';
import type { DrawProps, Line } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

function processData(startDate: Date, net: number[], income: number[], spending: number[]): Line[] {
  const opts: TimeValuesProps = { startDate };

  return [
    {
      key: 'net',
      data: getValuesWithTime(net, opts),
      arrows: true,
      color: profitLossColor,
    },
    {
      key: 'spending',
      data: getValuesWithTime(spending, opts),
      fill: false,
      smooth: true,
      color: colors[PageNonStandard.Overview].spending,
    },
    {
      key: 'savings-ratio',
      data: getValuesWithTime(
        income.map((value, index) =>
          value > 0 ? Math.min(1, Math.max(0, 1 - spending[index] / value)) : 0,
        ),
        opts,
      ),
      secondary: true,
      color: rgba(colors.green, 0.5),
      fill: false,
      dashed: true,
      smooth: true,
      strokeWidth: 1,
      movingAverage: {
        color: colors.green,
        period: 12,
        smooth: true,
        strokeWidth: 2,
      },
    },
  ];
}

export const GraphSpending: React.FC = () => {
  const today = useContext(TodayContext);
  const startDate = useSelector(getStartDate);
  const { net, income, spending } = useSelector(getProcessedMonthlyValues(today));

  const lines = useMemo<Line[]>(() => processData(startDate, net, income, spending), [
    startDate,
    net,
    income,
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

  return (
    <GraphCashFlow dualAxis today={today} name="spend" lines={lines} afterLines={afterLines} />
  );
};
