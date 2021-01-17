import { rgba } from 'polished';
import React, { useMemo, useContext } from 'react';

import { Key } from './key';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { profitLossColor } from '~client/components/graph/helpers';
import { TodayContext } from '~client/hooks';
import { colors } from '~client/styled/variables';
import type { DrawProps, Line, MergedMonthly } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

export type Props = {
  showAll: boolean;
  startDate: Date;
  futureMonths: number;
  monthly: Pick<MergedMonthly, 'income' | 'spending' | 'net'>;
};

function processData(
  startDate: Date,
  showAll: boolean,
  { net, income, spending }: Props['monthly'],
): Line[] {
  const opts: TimeValuesProps = { startDate };

  const arrows = {
    key: 'net',
    data: getValuesWithTime(net, opts),
    arrows: true,
    color: profitLossColor,
  };

  const spendingLine: Line = {
    key: 'spending',
    data: getValuesWithTime(spending, opts),
    fill: false,
    smooth: true,
    color: colors[PageNonStandard.Overview].spending,
    strokeWidth: 2,
  };

  const savingsRatio: Line = {
    key: 'savings-ratio',
    data: getValuesWithTime(
      income.map((value, index) =>
        value > 0 ? Math.min(1, Math.max(0, 1 - spending[index] / value)) : 0,
      ),
      opts,
    ),
    secondary: true,
    color: rgba(colors.green, showAll ? 0.2 : 0.5),
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
  };

  if (showAll) {
    return [spendingLine, savingsRatio];
  }

  return [arrows, spendingLine, savingsRatio];
}

export const GraphSpending: React.FC<Props> = ({ startDate, monthly, showAll }) => {
  const today = useContext(TodayContext);

  const lines = useMemo<Line[]>(() => processData(startDate, showAll, monthly), [
    startDate,
    showAll,
    monthly,
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
    <GraphCashFlow
      dualAxis
      minY2={0}
      maxY2={1}
      today={today}
      name="spend"
      lines={lines}
      afterLines={afterLines}
    />
  );
};
