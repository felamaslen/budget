import { rgba } from 'polished';
import React, { useState, useMemo, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import { AfterCanvas } from './after-canvas';
import { Key } from './key';
import { Targets, getTargets, TargetValue } from './targets';
import { GraphCashFlow, getValuesWithTime } from '~client/components/graph-cashflow';
import { TodayContext } from '~client/hooks';
import { lastInArray, leftPad, rightPad } from '~client/modules/data';
import {
  getStartDate,
  getFutureMonths,
  getProcessedCost,
  getNetWorthSummaryOld,
  getNetWorthTable,
  NetWorthSummaryOld,
  getHomeEquityOld,
  getHomeEquity,
} from '~client/selectors';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import type { CostProcessed, Data, Line, NetWorthTableRow, Point } from '~client/types';
import { Aggregate, PageNonStandard } from '~client/types/enum';

type CostProps = Pick<CostProcessed, PageNonStandard.Funds | 'fundsOld' | 'netWorthCombined'>;

const fillAggregate = (
  combinedLength: number,
  netWorth: NetWorthTableRow[],
  key: Aggregate,
  rightFill = true,
): number[] => {
  const presentData = netWorth.map(({ aggregate }) => aggregate[key]);
  return rightFill ? rightPad(presentData, combinedLength) : presentData;
};

type RawData = {
  homeEquityOld: number[];
  homeEquity: number[];
  cost: Pick<CostProps, 'netWorthCombined' | PageNonStandard.Funds | 'fundsOld'>;
  netWorthOldMain: number[];
  netWorthOldOptions: number[];
  netWorthTable: NetWorthTableRow[];
  showAll: boolean;
};

type ProcessedData = {
  netWorth: number[];
  options: number[];
  optionsStartIndex: number;
  homeEquity: number[];
  funds: number[];
  oldOffset: number;
  cashOther: number[];
  pension: number[];
};

type GraphData = { lines: Line[]; targetValues: TargetValue[] };

function processData({
  homeEquityOld,
  homeEquity,
  cost: { netWorthCombined, funds: fundsCurrent, fundsOld },
  netWorthTable,
  netWorthOldMain,
  netWorthOldOptions,
  showAll,
}: RawData): ProcessedData {
  const currentOptions = netWorthTable.map(({ options }) => options);
  const optionsStartIndex = currentOptions.findIndex((value) => value > 0);
  const options = rightPad(currentOptions, netWorthCombined.length);

  // value of "stocks" section that isn't accounted for by stock value
  const ISACash = fillAggregate(
    netWorthCombined.length,
    netWorthTable,
    Aggregate.stocks,
    false,
  ).map((value, index) => value - fundsCurrent[index]);

  const lastISACash = lastInArray(ISACash) ?? 0;
  const cashOther = fillAggregate(netWorthCombined.length, netWorthTable, Aggregate.cashOther).map(
    (value, index) => value + (ISACash[index] ?? lastISACash),
  );

  const pension = fillAggregate(netWorthCombined.length, netWorthTable, Aggregate.pension);

  const recordedHomeValue = fillAggregate(
    netWorthCombined.length,
    netWorthTable,
    Aggregate.realEstate,
  );
  const recordedMortgageDebt = fillAggregate(
    netWorthCombined.length,
    netWorthTable,
    Aggregate.mortgage,
  );

  const netWorthCombinedToStack = netWorthCombined.map(
    (value, index) =>
      value - (pension[index] + recordedHomeValue[index] + recordedMortgageDebt[index]),
  );

  if (showAll) {
    const oldOffset = Math.max(fundsOld.length, netWorthOldMain.length, netWorthOldOptions.length);
    const totalLength = oldOffset + netWorthCombined.length;

    return {
      netWorth: leftPad(netWorthOldMain.concat(netWorthCombinedToStack), totalLength),
      options: leftPad(netWorthOldOptions, oldOffset).concat(options),
      optionsStartIndex: netWorthOldOptions.concat(currentOptions).findIndex((value) => value > 0),
      homeEquity: leftPad(homeEquityOld.concat(homeEquity), totalLength),
      funds: leftPad(fundsOld, oldOffset).concat(fundsCurrent),
      oldOffset,
      cashOther: leftPad(cashOther, totalLength),
      pension: leftPad(pension, totalLength),
    };
  }

  return {
    netWorth: netWorthCombinedToStack,
    options,
    optionsStartIndex,
    homeEquity,
    funds: fundsCurrent,
    oldOffset: 0,
    cashOther,
    pension,
  };
}

function getGraphData(rawData: RawData, startDate: Date, futureMonths: number): GraphData {
  const {
    netWorth,
    homeEquity,
    options,
    optionsStartIndex,
    funds,
    oldOffset,
    cashOther,
    pension,
  } = processData(rawData);

  const { netWorthCombined } = rawData.cost;
  const { netWorthOldMain, showAll } = rawData;
  const futureIndex = oldOffset + netWorthCombined.length - futureMonths;

  const opts = { oldOffset, startDate };

  const dataNetWorth = getValuesWithTime(netWorth, opts);
  const dataHomeEquity = getValuesWithTime(homeEquity, opts);
  const dataOptions =
    optionsStartIndex === -1
      ? []
      : getValuesWithTime(options, opts).slice(Math.max(0, optionsStartIndex - 1));
  const dataCashOther = getValuesWithTime(cashOther, opts);
  const dataPension = getValuesWithTime(pension, { oldOffset, startDate });

  const dataFunds: Data = funds.map((value, index) => [dataNetWorth[index][0], value]);

  const targets = getTargets(
    startDate,
    netWorthOldMain.concat(netWorthCombined),
    showAll,
    netWorthOldMain.length,
    futureMonths,
  );

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
      key: 'cash-locked',
      data: dataCashOther,
      stack: [dataHomeEquity, dataFunds],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.cashOther], 0.4),
    },
    {
      key: 'funds',
      data: dataFunds,
      stack: [dataHomeEquity],
      fill: true,
      smooth: true,
      color: rgba(colors.funds.main, 0.4),
    },
    {
      key: 'net-worth-without-pension',
      data: dataNetWorth,
      stack: [dataHomeEquity],
      fill: false,
      smooth: true,
      color: (_: Point, index = 0): string =>
        index < futureIndex - 1
          ? colors[PageNonStandard.Overview].balanceActual
          : colors[PageNonStandard.Overview].balancePredicted,
    },
    {
      key: 'pension',
      data: dataPension,
      stack: [dataHomeEquity, dataNetWorth],
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.pension], 0.5),
    },
    {
      key: 'options',
      data: dataOptions,
      stack: [dataHomeEquity, dataNetWorth, dataPension].map((group) =>
        group.slice(optionsStartIndex - 1),
      ),
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

export type Props = { isMobile: boolean };

const isNetWorthSummaryOldEqual = (left: NetWorthSummaryOld, right: NetWorthSummaryOld): boolean =>
  left.main === right.main && left.options === right.options;

export const GraphBalance: React.FC<Props> = ({ isMobile }) => {
  const today = useContext(TodayContext);
  const startDate = useSelector(getStartDate);
  const homeEquityOld = useSelector(getHomeEquityOld);
  const homeEquity = useSelector(getHomeEquity(today));
  const netWorthOld = useSelector(getNetWorthSummaryOld, isNetWorthSummaryOldEqual);
  const netWorthTable = useSelector(getNetWorthTable);
  const futureMonths = useSelector(getFutureMonths(today));
  const cost = useSelector(getProcessedCost(today));

  const [showAll, setShowAll] = useState(false);
  const { lines, targetValues } = useMemo<GraphData>(
    () =>
      getGraphData(
        {
          homeEquityOld,
          homeEquity,
          cost,
          netWorthOldMain: netWorthOld.main,
          netWorthOldOptions: netWorthOld.options,
          netWorthTable,
          showAll,
        },
        startDate,
        futureMonths,
      ),
    [
      startDate,
      homeEquityOld,
      homeEquity,
      cost,
      netWorthOld.main,
      netWorthOld.options,
      netWorthTable,
      showAll,
      futureMonths,
    ],
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
