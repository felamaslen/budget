import { rgba } from 'polished';
import React, { useMemo, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import { AfterCanvas } from './after-canvas';
import { Key } from './key';
import { Targets, getTargets, TargetValue } from './targets';
import {
  GraphCashFlow,
  getValuesWithTime,
  TimeValuesProps,
} from '~client/components/graph-cashflow';
import { TodayContext } from '~client/hooks';
import { getStartDate, getFutureMonths, getProcessedMonthlyValues } from '~client/selectors';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import type { Line, MonthlyProcessed } from '~client/types';
import { Aggregate, PageNonStandard } from '~client/types/enum';

type GraphData = { lines: Line[]; targetValues: TargetValue[] };

function getGraphData(
  { netWorth, pension, homeEquity, stocks, investments, cashOther, options }: MonthlyProcessed,
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

  const optionsStartIndex = Math.max(0, dataOptions.findIndex(([, value]) => value > 0) - 1);

  const dataHomeEquity = getValuesWithTime(homeEquity, opts);
  const dataStocks = getValuesWithTime(stocks, opts);
  const dataLockedCash = getValuesWithTime(lockedCash, opts);

  const targets = getTargets(startDate, netWorth, futureMonths);

  const lines: Line[] = [
    {
      key: 'targets',
      data: targets.line,
      hover: false,
      fill: false,
      smooth: false,
      color: colors.light.dark,
      strokeWidth: 1,
    },
    {
      key: 'home-equity',
      data: dataHomeEquity,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.homeEquity, 0.5),
      strokeWidth: 2,
    },
    {
      key: 'stocks',
      data: dataStocks,
      stack: [dataHomeEquity],
      fill: true,
      smooth: true,
      color: rgba(colors.funds.main, 0.4),
    },
    {
      key: 'locked-cash',
      data: dataLockedCash,
      stack: [dataHomeEquity, dataStocks],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.cashOther], 0.4),
    },
    {
      key: 'net-worth-without-pension',
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
      data: dataPension,
      stack: [dataNetWorth],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.pension], 0.5),
    },
    {
      key: 'options',
      data: dataOptions.slice(optionsStartIndex),
      stack: [dataNetWorth, dataPension].map((stack) => stack.slice(optionsStartIndex)),
      fill: false,
      smooth: true,
      color: colors.netWorth.options,
      dashed: true,
      strokeWidth: 1,
    },
  ];

  return { lines, targetValues: targets.targetValues };
}

function makeAfterLines(targetValues: TargetValue[]): React.FC {
  const AfterLines: React.FC = () => (
    <g>
      <Targets targetValues={targetValues} />
      <Key title="Net worth" />
    </g>
  );

  return AfterLines;
}

export type Props = {
  isMobile: boolean;
  showAll: boolean;
  setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
};

export const GraphBalance: React.FC<Props> = ({ isMobile, showAll, setShowAll }) => {
  const today = useContext(TodayContext);
  const startDate = useSelector(getStartDate);
  const futureMonths = useSelector(getFutureMonths(today));
  const monthly = useSelector(getProcessedMonthlyValues(today));

  const { lines, targetValues } = useMemo<GraphData>(
    () => getGraphData(monthly, startDate, futureMonths),
    [monthly, startDate, futureMonths],
  );

  const afterLines = useMemo(() => makeAfterLines(targetValues), [targetValues]);

  const after = useCallback(() => <AfterCanvas showAll={showAll} setShowAll={setShowAll} />, [
    showAll,
    setShowAll,
  ]);

  return (
    <GraphCashFlow
      isMobile={isMobile}
      today={today}
      name="balance"
      graphHeight={isMobile ? graphOverviewHeightMobile : undefined}
      lines={lines}
      afterLines={afterLines}
      after={after}
    />
  );
};
