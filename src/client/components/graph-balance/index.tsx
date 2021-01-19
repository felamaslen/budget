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
import { TodayContext } from '~client/hooks';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import type { Line, MergedMonthly } from '~client/types';
import { Aggregate, PageNonStandard } from '~client/types/enum';

type GraphData = { lines: Line[]; targetValues: TargetValue[] };

function getGraphData(
  { netWorth, pension, homeEquity, stocks, investments, cashOther, options }: MergedMonthly,
  startDate: Date,
  futureMonths: number,
): GraphData {
  const futureIndex = netWorth.length - futureMonths;

  const investmentCash = investments.map((value, index) => Math.max(0, value - stocks[index]));
  const lockedCash = cashOther.map((value, index) => value + investmentCash[index]);

  const withoutPension = netWorth.map((value, index) => value - pension[index]);

  const opts: TimeValuesProps = { startDate };

  const dataNetWorth = getValuesWithTime(withoutPension, opts);
  const dataPension = getValuesWithTime(pension, opts);
  const dataOptions = getValuesWithTime(options, opts);

  const dataHomeEquity = getValuesWithTime(homeEquity, opts);
  const dataStocks = getValuesWithTime(stocks, opts);
  const dataLockedCash = getValuesWithTime(lockedCash, opts);

  const targets = getTargets(startDate, netWorth, futureMonths);

  const lines: Line[] = [
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
      key: 'locked-cash',
      name: 'Locked cash',
      data: dataLockedCash,
      stack: [dataHomeEquity, dataStocks],
      sliceAtFirstPositive: 1,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.cashOther], 0.4),
    },
    {
      key: 'net-worth-without-pension',
      name: 'Net worth (excl. pension)',
      data: dataNetWorth,
      fill: false,
      smooth: true,
      color: (_, index = 0): string =>
        index < futureIndex
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
      color: rgba(colors.netWorth.aggregate[Aggregate.pension], 0.5),
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

  return { lines, targetValues: targets.targetValues };
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

  const { lines, targetValues } = useMemo<GraphData>(
    () => getGraphData(monthly, startDate, futureMonths),
    [monthly, startDate, futureMonths],
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
      After={<AfterCanvas showAll={showAll} setShowAll={setShowAll} isLoading={isLoading} />}
    />
  );
};
