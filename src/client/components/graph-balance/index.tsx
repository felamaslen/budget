import { rgba } from 'polished';
import React, { useMemo, useContext } from 'react';

import { AfterCanvas } from './after-canvas';
import { Key } from './key';
import { Targets, getTargets, TargetValue } from './targets';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { TodayContext, usePersistentState } from '~client/hooks';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import type { Line, MergedMonthly } from '~client/types';
import { PageNonStandard } from '~client/types/enum';
import { NetWorthAggregate } from '~shared/constants';

type GraphData = { lines: Line[]; targetValues: TargetValue[] };

function getGraphData(
  monthly: MergedMonthly,
  startDate: Date,
  futureMonths: number,
  showLiabilities: boolean,
): GraphData {
  const investmentCash = monthly.investments.map((value, index) =>
    Math.max(0, value - monthly.stocks[index]),
  );
  const lockedCash = monthly.cashOther.map((value, index) => value + investmentCash[index]);

  const withoutPension = monthly.netWorth.map((value, index) => value - monthly.pension[index]);

  const opts: TimeValuesProps = { startDate };

  const dataAssets = getValuesWithTime(monthly.assets, opts);
  const dataLiabilities = getValuesWithTime(monthly.liabilities, opts);
  const dataNetWorth = getValuesWithTime(withoutPension, opts);
  const dataPension = getValuesWithTime(monthly.pension, opts);
  const dataOptions = getValuesWithTime(monthly.options, opts);

  const dataHomeEquity = getValuesWithTime(monthly.homeEquity, opts);
  const dataStocks = getValuesWithTime(monthly.stocks, opts);
  const dataStockCostBasis = getValuesWithTime(monthly.stockCostBasis, opts);
  const dataLockedCash = getValuesWithTime(lockedCash, opts);

  const targets = getTargets(startDate, monthly.netWorth, futureMonths);

  const linesCommon: Line[] = [
    {
      key: 'targets',
      name: 'Targets',
      data: targets.line,
      hover: false,
      fill: false,
      smooth: false,
      color: colors.light.dark,
      strokeWidth: 1,
    },
    {
      key: 'home-equity',
      name: 'Home equity',
      data: dataHomeEquity,
      sliceAtFirstPositive: 2,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.homeEquity, 0.5),
      strokeWidth: 2,
    },
    {
      key: 'stocks',
      name: 'Stocks',
      data: dataStocks,
      stack: [dataHomeEquity],
      sliceAtFirstPositive: 1,
      fill: true,
      smooth: true,
      color: rgba(colors.funds.main, 0.4),
    },
    {
      key: 'stock-cost-basis',
      name: 'Stock cost basis',
      data: dataStockCostBasis,
      stack: [dataHomeEquity],
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
      stack: [dataHomeEquity, dataStocks],
      sliceAtFirstPositive: 1,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[NetWorthAggregate.cashOther], 0.4),
    },
    {
      key: 'net-worth-without-pension',
      name: 'Net worth (excl. pension)',
      data: dataNetWorth,
      fill: false,
      smooth: true,
      color: (_: unknown, index = 0): string =>
        index < monthly.startPredictionIndex - 1
          ? colors[PageNonStandard.Overview].balanceActual
          : colors[PageNonStandard.Overview].balancePredicted,
    },
    {
      key: 'pension',
      name: 'Pension',
      data: dataPension,
      stack: [dataNetWorth],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[NetWorthAggregate.pension], 0.5),
    },
    {
      key: 'options',
      name: 'Options',
      data: dataOptions,
      stack: [dataNetWorth, dataPension],
      sliceAtFirstPositive: 1,
      fill: false,
      smooth: true,
      color: colors.netWorth.options,
      dashed: true,
      strokeWidth: 1,
    },
  ];

  const lines: Line[] = showLiabilities
    ? [
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
      ]
    : linesCommon;

  return { lines: lines as Line[], targetValues: targets.targetValues };
}

export type Props = {
  isMobile: boolean;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  startDate: Date;
  futureMonths: number;
  monthly: MergedMonthly;
};

export const GraphBalance: React.FC<Props> = ({
  isMobile,
  showAll,
  setShowAll,
  isLoading,
  startDate,
  futureMonths,
  monthly,
}) => {
  const today = useContext(TodayContext);
  const [showLiabilities, setShowLiabilities] = usePersistentState<boolean>(
    false,
    'split_net_worth_graph',
  );

  const { lines, targetValues } = useMemo<GraphData>(
    () => getGraphData(monthly, startDate, futureMonths, showLiabilities),
    [monthly, startDate, futureMonths, showLiabilities],
  );

  return (
    <GraphCashFlow
      isMobile={isMobile}
      today={today}
      graphHeight={isMobile ? graphOverviewHeightMobile : undefined}
      lines={lines}
      AfterLines={
        <g>
          <Targets targetValues={targetValues} />
          <Key title="Net worth" />
        </g>
      }
      After={
        <AfterCanvas
          showAll={showAll}
          setShowAll={setShowAll}
          isLoading={isLoading}
          showLiabilities={showLiabilities}
          setShowLiabilities={setShowLiabilities}
        />
      }
    />
  );
};
