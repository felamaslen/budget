import React, { useMemo, useContext, useCallback } from 'react';

import { Key } from './key';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { profitLossColor, transformToMovingAverage } from '~client/components/graph/helpers';
import { TodayContext } from '~client/hooks';
import { colors } from '~client/styled/variables';
import type { DrawProps, Line, MergedMonthly } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

export type Props = {
  showAll: boolean;
  startDate: Date;
  futureMonths: number;
  monthly: Pick<MergedMonthly, 'income' | 'spending' | 'net'>;
  investmentRatio: number[];
};

function processData(
  startDate: Date,
  showAll: boolean,
  { net, income, spending }: Props['monthly'],
  investments: number[],
): Line[] {
  const opts: TimeValuesProps = { startDate };

  const arrows: Line = {
    key: 'net',
    name: 'Cash flow',
    data: getValuesWithTime(net, opts),
    arrows: true,
    color: profitLossColor,
  };

  const spendingLine: Line = {
    key: 'spending',
    name: 'Expenses',
    data: transformToMovingAverage(getValuesWithTime(spending, opts), 3),
    fill: false,
    smooth: true,
    color: colors[PageNonStandard.Overview].spending,
    strokeWidth: 2,
  };

  const savingsRatio: Line = {
    key: 'savings-ratio',
    name: 'Savings ratio',
    data: transformToMovingAverage(
      getValuesWithTime(
        income.map((value, index) =>
          value > 0 ? Math.min(1, Math.max(0, 1 - spending[index] / value)) : 0,
        ),
        opts,
      ),
      12,
    ),
    secondary: true,
    color: colors.green,
    smooth: true,
    strokeWidth: 2,
  };

  const investmentRatio: Line = {
    key: 'investment-ratio',
    name: 'Investment ratio',
    data: getValuesWithTime(investments, opts),
    secondary: true,
    color: colors.funds.main,
    smooth: true,
    strokeWidth: 2,
  };

  if (showAll) {
    return [spendingLine, savingsRatio, investmentRatio];
  }

  return [arrows, spendingLine, savingsRatio, investmentRatio];
}

export const GraphSpending: React.FC<Props> = ({
  startDate,
  monthly,
  investmentRatio,
  showAll,
}) => {
  const today = useContext(TodayContext);

  const lines = useMemo<Line[]>(() => processData(startDate, showAll, monthly, investmentRatio), [
    startDate,
    showAll,
    monthly,
    investmentRatio,
  ]);

  const AfterLines = useCallback<React.FC<DrawProps>>(
    (props) => <Key now={today} title="Cash flow" {...props} />,
    [today],
  );

  return (
    <GraphCashFlow
      dualAxis
      minY2={0}
      maxY2={1}
      today={today}
      lines={lines}
      AfterLines={AfterLines}
    />
  );
};
