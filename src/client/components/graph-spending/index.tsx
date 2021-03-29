import React, { useMemo, useContext, useCallback } from 'react';

import { Key } from './key';
import { GraphCashFlow, getValuesWithTime } from '~client/components/graph-cashflow';
import { Sidebar } from '~client/components/graph-cashflow/sidebar';
import { ToggleContainer } from '~client/components/graph-cashflow/toggle';
import { profitLossColor, transformToMovingAverage } from '~client/components/graph/helpers';
import { TodayContext, usePersistentState } from '~client/hooks';
import { cumulativeSum } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { DrawProps, Line, OverviewGraph } from '~client/types';
import { PageNonStandard } from '~client/types/enum';

export type Props = {
  showAll: boolean;
  longTerm: boolean;
  graph: OverviewGraph;
  investments: number[];
};

const getRatioToIncome = (income: number[], values: number[]): number[] =>
  income.map((value, index) => (value > 0 ? Math.min(1, Math.max(0, values[index] / value)) : 0));

const inverseRatio = (values: number[]): number[] => values.map((value) => 1 - value);

function processData(
  longTerm: boolean,
  isCumulative: boolean,
  graph: OverviewGraph,
  investments: number[],
): Line[] {
  const arrows: Line[] =
    longTerm || isCumulative
      ? []
      : [
          {
            key: 'net',
            name: 'Cash flow',
            data: getValuesWithTime(graph.dates, graph.values.net),
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
        ? getValuesWithTime(graph.dates, cumulativeSum(graph.values.spending))
        : transformToMovingAverage(getValuesWithTime(graph.dates, graph.values.spending), 3, true),
      fill: false,
      smooth: true,
      color: colors[PageNonStandard.Overview].spending,
      strokeWidth: 2,
    },
    {
      key: 'investments',
      name: 'Investments',
      data: isCumulative
        ? getValuesWithTime(graph.dates, cumulativeSum(investments))
        : getValuesWithTime(
            graph.dates,
            getRatioToIncome(cumulativeSum(graph.values.income), cumulativeSum(investments)),
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
          data: getValuesWithTime(graph.dates, cumulativeSum(graph.values.income)),
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
                graph.dates,
                inverseRatio(
                  getRatioToIncome(
                    cumulativeSum(graph.values.income),
                    cumulativeSum(graph.values.spending),
                  ),
                ),
              )
            : transformToMovingAverage(
                getValuesWithTime(
                  graph.dates,
                  inverseRatio(getRatioToIncome(graph.values.income, graph.values.spending)),
                ),
                12,
              ),
          secondary: true,
          color: colors.green,
          smooth: true,
          strokeWidth: 2,
        },
  ];
}

export const GraphSpending: React.FC<Props> = ({ graph, investments, showAll, longTerm }) => {
  const today = useContext(TodayContext);

  const [isCumulative, setCumulative] = usePersistentState<boolean>(
    false,
    'cumulative-cashflow-graph',
  );

  const lines = useMemo<Line[]>(
    () => processData(showAll || longTerm, isCumulative, graph, investments),
    [showAll, longTerm, isCumulative, graph, investments],
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
      After={
        <Sidebar>
          <ToggleContainer value={isCumulative} setValue={setCumulative}>
            Cumulative
          </ToggleContainer>
        </Sidebar>
      }
    />
  );
};
