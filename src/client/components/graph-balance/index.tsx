import { rgba } from 'polished';
import React, { useMemo, useContext } from 'react';

import { Key } from './key';
import { LongTermSettings, Props as LongTermSettingsProps } from './long-term';
import { GraphCashFlow, getValuesWithTime } from '~client/components/graph-cashflow';
import { Sidebar } from '~client/components/graph-cashflow/sidebar';
import { ToggleContainer } from '~client/components/graph-cashflow/toggle';
import type { GraphCashFlowTitle } from '~client/components/graph-cashflow/types';
import { TodayContext, usePersistentState } from '~client/hooks';
import { SettingsFull, SettingsGroup } from '~client/styled/shared/settings';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import type { Line, LongTermOptions, OverviewGraph } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import { NetWorthAggregate } from '~shared/constants';

function getGraphData(graph: OverviewGraph, showLiabilities: boolean): Line[] {
  const withoutPension = graph.values.netWorth.map(
    (value, index) => value - graph.values.pension[index],
  );

  const dataAssets = getValuesWithTime(graph.dates, graph.values.assets);
  const dataLiabilities = getValuesWithTime(graph.dates, graph.values.liabilities);
  const dataNetWorth = getValuesWithTime(graph.dates, graph.values.netWorth);
  const dataWithoutPension = getValuesWithTime(graph.dates, withoutPension);
  const dataPension = getValuesWithTime(graph.dates, graph.values.pension);
  const dataOptions = getValuesWithTime(graph.dates, graph.values.options);

  const dataIlliquidEquity = getValuesWithTime(graph.dates, graph.values.illiquidEquity);
  const dataStocks = getValuesWithTime(graph.dates, graph.values.stocks);
  const dataStockCostBasis = getValuesWithTime(graph.dates, graph.values.stockCostBasis);
  const dataLockedCash = getValuesWithTime(graph.dates, graph.values.cashOther);

  const linesCommon: Line[] = [
    {
      key: 'illiquid-equity',
      name: 'Illiquid equity',
      data: dataIlliquidEquity,
      sliceAtFirstPositive: 2,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.illiquidEquity, 0.5),
      strokeWidth: 2,
    },
    {
      key: 'stocks',
      name: 'Stocks',
      data: dataStocks,
      stack: [dataIlliquidEquity],
      sliceAtFirstPositive: 1,
      fill: true,
      smooth: true,
      color: rgba(colors.funds.main, 0.4),
    },
    {
      key: 'stock-cost-basis',
      name: 'Stock cost basis',
      data: dataStockCostBasis,
      stack: [dataIlliquidEquity],
      sliceAtFirstPositive: 1,
      fill: false,
      strokeWidth: 1,
      smooth: false,
      dashed: true,
      color: rgba(colors.funds.main, 0.5),
    },
    {
      key: 'locked-cash',
      name: 'Locked cash',
      data: dataLockedCash,
      stack: [dataIlliquidEquity, dataStocks],
      sliceAtFirstPositive: 1,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[NetWorthAggregate.cashOther], 0.4),
    },
    {
      key: 'net-worth',
      name: 'Net worth',
      data: dataNetWorth,
      fill: false,
      smooth: true,
      color: (_: unknown, index = 0): string =>
        index < graph.startPredictionIndex - 1
          ? colors[PageNonStandard.Overview].balanceActual
          : colors[PageNonStandard.Overview].balancePredicted,
    },
    {
      key: 'pension',
      name: 'Pension',
      data: dataPension,
      stack: [dataWithoutPension],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[NetWorthAggregate.pension], 0.5),
    },
    {
      key: 'options',
      name: 'Options',
      data: dataOptions,
      stack: [dataNetWorth],
      sliceAtFirstPositive: 1,
      fill: false,
      smooth: true,
      color: colors.netWorth.options,
      dashed: true,
      strokeWidth: 1,
    },
  ];

  if (!showLiabilities) {
    return linesCommon;
  }

  return [
    ...linesCommon,
    {
      key: 'assets',
      name: 'Assets',
      data: dataAssets,
      fill: false,
      strokeWidth: 1,
      smooth: true,
      color: colors.green,
    },
    {
      key: 'liabilities',
      name: 'Liabilities',
      data: dataLiabilities.map(([x, y]) => [x, Math.max(0, -y)]),
      fill: false,
      strokeWidth: 1,
      smooth: true,
      color: colors.overview.spending,
    },
  ];
}

export type Props = {
  isMobile: boolean;
  setMobileGraph: React.Dispatch<React.SetStateAction<GraphCashFlowTitle>>;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  graph: OverviewGraph;
  longTermOptions: LongTermOptions;
  setLongTermOptions: React.Dispatch<React.SetStateAction<LongTermOptions>>;
} & Pick<LongTermSettingsProps, 'defaultRates'>;

export const GraphBalance: React.FC<Props> = ({
  isMobile,
  setMobileGraph,
  showAll,
  setShowAll,
  isLoading,
  graph,
  longTermOptions,
  setLongTermOptions,
  defaultRates,
}) => {
  const today = useContext(TodayContext);
  const [showLiabilities, setShowLiabilities] = usePersistentState<boolean>(
    false,
    'split_net_worth_graph',
  );

  const lines = useMemo<Line[]>(() => getGraphData(graph, showLiabilities), [
    graph,
    showLiabilities,
  ]);

  return (
    <GraphCashFlow
      isMobile={isMobile}
      today={today}
      graphHeight={isMobile ? graphOverviewHeightMobile : undefined}
      lines={lines}
      AfterLines={<Key title="Net worth" setMobileGraph={setMobileGraph} />}
      After={
        <Sidebar>
          <SettingsGroup>
            <SettingsFull>
              <ToggleContainer value={showLiabilities} setValue={setShowLiabilities}>
                Split
              </ToggleContainer>
            </SettingsFull>
          </SettingsGroup>
          <SettingsGroup>
            <SettingsFull>
              <ToggleContainer value={showAll} setValue={setShowAll} isLoading={isLoading}>
                Show all
              </ToggleContainer>
            </SettingsFull>
          </SettingsGroup>
          <LongTermSettings
            options={longTermOptions}
            setOptions={setLongTermOptions}
            defaultRates={defaultRates}
          />
        </Sidebar>
      }
    />
  );
};
