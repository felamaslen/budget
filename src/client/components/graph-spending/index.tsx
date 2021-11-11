import { useMemo, useCallback } from 'react';
import { replaceAtIndex } from 'replace-array';

import { Key } from './key';
import { GraphCashFlow, getValuesWithTime } from '~client/components/graph-cashflow';
import { Sidebar } from '~client/components/graph-cashflow/sidebar';
import { ToggleContainer } from '~client/components/graph-cashflow/toggle';
import type { GraphCashFlowTitle } from '~client/components/graph-cashflow/types';
import { transformToMovingAverage } from '~client/components/graph/helpers';
import { usePersistentState, useToday } from '~client/hooks';
import { cumulativeSum } from '~client/modules/data';
import { SettingsFull, SettingsGroup } from '~client/styled/shared/settings';
import { colors, graphOverviewHeightMobile } from '~client/styled/variables';
import { DrawProps, Line, OverviewGraph } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import type { InitialCumulativeValues } from '~client/types/gql';

export type Props = {
  isMobile: boolean;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  longTerm: boolean;
  graph: OverviewGraph;
  initialCumulativeValues: InitialCumulativeValues;
  investments: number[];
  setMobileGraph: React.Dispatch<React.SetStateAction<GraphCashFlowTitle>>;
};

const getRatioToIncome = (income: number[], values: number[]): number[] =>
  income.map((value, index) => (value > 0 ? Math.min(1, Math.max(0, values[index] / value)) : 0));

const inverseRatio = (values: number[]): number[] => values.map((value) => 1 - value);

const insertInitialValue = (values: number[], initialValue: number): number[] =>
  replaceAtIndex(values, 0, (last) => initialValue + last);

function processData(
  showAll: boolean,
  isCumulative: boolean,
  graph: OverviewGraph,
  initialCumulativeValues: InitialCumulativeValues,
  investments: number[],
): Line[] {
  const income = showAll
    ? graph.values.income
    : insertInitialValue(graph.values.income, initialCumulativeValues.income);

  const spending = showAll
    ? graph.values.spending
    : insertInitialValue(graph.values.spending, initialCumulativeValues.spending);

  return [
    {
      key: 'spending',
      name: 'Expenses',
      data: isCumulative
        ? getValuesWithTime(graph.dates, cumulativeSum(spending))
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
            getRatioToIncome(cumulativeSum(income), cumulativeSum(investments)),
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
          data: getValuesWithTime(graph.dates, cumulativeSum(income)),
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
                inverseRatio(getRatioToIncome(cumulativeSum(income), cumulativeSum(spending))),
              )
            : transformToMovingAverage(
                getValuesWithTime(graph.dates, inverseRatio(getRatioToIncome(income, spending))),
                12,
              ),
          secondary: true,
          color: colors.green,
          smooth: true,
          strokeWidth: 2,
        },
  ];
}

export const GraphSpending: React.FC<Props> = ({
  isMobile,
  graph,
  initialCumulativeValues,
  investments,
  showAll,
  setShowAll,
  setMobileGraph,
}) => {
  const today = useToday();

  const [isCumulative, setCumulative] = usePersistentState<boolean>(
    false,
    'cumulative-cashflow-graph',
  );

  const lines = useMemo<Line[]>(
    () => processData(showAll, isCumulative, graph, initialCumulativeValues, investments),
    [showAll, isCumulative, graph, initialCumulativeValues, investments],
  );

  const AfterLines = useCallback<React.FC<DrawProps>>(
    (props) => (
      <Key
        isCumulative={isCumulative}
        now={today}
        title="Cash flow"
        {...props}
        setMobileGraph={setMobileGraph}
      />
    ),
    [today, isCumulative, setMobileGraph],
  );

  return (
    <GraphCashFlow
      dualAxis={!isCumulative}
      minY2={0}
      maxY2={1}
      graphHeight={isMobile ? graphOverviewHeightMobile : undefined}
      today={today}
      lines={lines}
      AfterLines={AfterLines}
      After={
        <Sidebar>
          <SettingsGroup>
            <SettingsFull>
              <ToggleContainer value={isCumulative} setValue={setCumulative}>
                Cumulative
              </ToggleContainer>
            </SettingsFull>
          </SettingsGroup>
          <SettingsGroup>
            <SettingsFull>
              <ToggleContainer value={showAll} setValue={setShowAll}>
                Show all
              </ToggleContainer>
            </SettingsFull>
          </SettingsGroup>
        </Sidebar>
      }
    />
  );
};
