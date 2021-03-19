import React, { useMemo, useContext, useCallback } from 'react';

import { AfterCanvas } from './after-canvas';
import { Key } from './key';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { profitLossColor, transformToMovingAverage } from '~client/components/graph/helpers';
import { TodayContext, usePersistentState } from '~client/hooks';
import { cumulativeSum } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { DrawProps, Line, MergedMonthly } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

export type Props = {
  showAll: boolean;
  startDate: Date;
  futureMonths: number;
  monthly: Pick<MergedMonthly, 'income' | 'spending' | 'net'>;
  investments: number[];
};

const getRatioToIncome = (income: number[], values: number[]): number[] =>
  income.map((value, index) => (value > 0 ? Math.min(1, Math.max(0, values[index] / value)) : 0));

const inverseRatio = (values: number[]): number[] => values.map((value) => 1 - value);

function processData(
  startDate: Date,
  showAll: boolean,
  isCumulative: boolean,
  { net, income, spending }: Props['monthly'],
  investments: number[],
): Line[] {
  const opts: TimeValuesProps = { startDate };

  const arrows: Line[] =
    showAll || isCumulative
      ? []
      : [
          {
            key: 'net',
            name: 'Cash flow',
            data: getValuesWithTime(net, opts),
            arrows: true,
            color: profitLossColor,
          },
        ];

  return [
    ...arrows,
    {
      key: 'spending',
      name: 'Expenses',
      data: isCumulative
        ? getValuesWithTime(cumulativeSum(spending), opts)
        : transformToMovingAverage(getValuesWithTime(spending, opts), 3),
      fill: false,
      smooth: true,
      color: colors[PageNonStandard.Overview].spending,
      strokeWidth: 2,
    },
    {
      key: 'investments',
      name: 'Investments',
      data: isCumulative
        ? getValuesWithTime(cumulativeSum(investments), opts)
        : getValuesWithTime(
            getRatioToIncome(cumulativeSum(income), cumulativeSum(investments)),
            opts,
          ),
      color: colors.funds.main,
      smooth: true,
      secondary: !isCumulative,
      strokeWidth: 2,
    },
    isCumulative
      ? {
          key: 'income',
          name: 'Income',
          data: getValuesWithTime(cumulativeSum(income), opts),
          fill: false,
          smooth: true,
          color: colors.green,
          strokeWidth: 2,
        }
      : {
          key: 'savings-ratio',
          name: 'Savings ratio',
          data: isCumulative
            ? getValuesWithTime(
                inverseRatio(getRatioToIncome(cumulativeSum(income), cumulativeSum(spending))),
                opts,
              )
            : transformToMovingAverage(
                getValuesWithTime(inverseRatio(getRatioToIncome(income, spending)), opts),
                12,
              ),
          secondary: true,
          color: colors.green,
          smooth: true,
          strokeWidth: 2,
        },
  ];
}

export const GraphSpending: React.FC<Props> = ({ startDate, monthly, investments, showAll }) => {
  const today = useContext(TodayContext);

  const [isCumulative, setCumulative] = usePersistentState<boolean>(
    false,
    'cumulative-cashflow-graph',
  );

  const lines = useMemo<Line[]>(
    () => processData(startDate, showAll, isCumulative, monthly, investments),
    [startDate, showAll, isCumulative, monthly, investments],
  );

  const AfterLines = useCallback<React.FC<DrawProps>>(
    (props) => <Key isCumulative={isCumulative} now={today} title="Cash flow" {...props} />,
    [today, isCumulative],
  );

  return (
    <GraphCashFlow
      dualAxis={!isCumulative}
      minY2={0}
      maxY2={1}
      today={today}
      lines={lines}
      AfterLines={AfterLines}
      After={<AfterCanvas isCumulative={isCumulative} setCumulative={setCumulative} />}
    />
  );
};
