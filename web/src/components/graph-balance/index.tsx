import { rgba } from 'polished';
import React, { useState, useMemo, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import { AfterCanvas } from './after-canvas';
import { Key } from './key';
import { Targets, getTargets, TargetValue } from './targets';
import { GraphCashFlow, getValuesWithTime } from '~client/components/graph-cashflow';
import { TodayContext } from '~client/hooks';
import { leftPad, rightPad } from '~client/modules/data';
import {
  getStartDate,
  getFutureMonths,
  getProcessedCost,
  getNetWorthSummaryOld,
  getNetWorthTable,
  NetWorthSummaryOld,
  getHomeEquityOld,
} from '~client/selectors';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import { Page, Point, Line, Data, CostProcessed, NetWorthTableRow, Aggregate } from '~client/types';

type CostProps = Pick<CostProcessed, Page.funds | 'fundsOld' | 'netWorthCombined'>;

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
  cost: Pick<CostProps, 'netWorthCombined' | Page.funds | 'fundsOld'>;
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
  cost: { netWorthCombined, funds: fundsCurrent, fundsOld },
  netWorthTable,
  netWorthOldMain,
  netWorthOldOptions,
  showAll,
}: RawData): ProcessedData {
  const homeEquityToPresent = netWorthTable.map<number>(
    ({ aggregate }) => aggregate[Aggregate.realEstate] + aggregate[Aggregate.mortgage],
  );
  // TODO: predict home equity. Need: mortgage rate, start date, term
  // (presume house price inflation to be 5% annualised)
  const homeEquityCurrent = rightPad(
    homeEquityToPresent,
    netWorthCombined.length,
    homeEquityToPresent[homeEquityToPresent.length - 1] ?? 0,
  );

  const currentOptions = netWorthTable.map(({ options }) => options);
  const optionsStartIndex = currentOptions.findIndex((value) => value > 0);
  const options = rightPad(currentOptions, netWorthCombined.length).map(
    (value, index) => value + netWorthCombined[index],
  );

  // value of "stocks" section that isn't accounted for by stock value
  const ISACash = fillAggregate(
    netWorthCombined.length,
    netWorthTable,
    Aggregate.stocks,
    false,
  ).map((value, index) => value - fundsCurrent[index]);

  const lastISACash = ISACash[ISACash.length - 1] ?? 0;
  const cashOther = fillAggregate(netWorthCombined.length, netWorthTable, Aggregate.cashOther).map(
    (value, index) => value + (ISACash[index] ?? lastISACash),
  );

  const pension = fillAggregate(netWorthCombined.length, netWorthTable, Aggregate.pension);

  const withoutPension = netWorthCombined.map((value, index) => value - pension[index]);

  if (showAll) {
    const oldOffset = Math.max(fundsOld.length, netWorthOldMain.length, netWorthOldOptions.length);
    const totalLength = oldOffset + netWorthCombined.length;

    return {
      netWorth: leftPad(netWorthOldMain.concat(withoutPension), totalLength),
      options: leftPad(
        netWorthOldOptions.map((value, index) => value + netWorthOldMain[index]),
        oldOffset,
      ).concat(options),
      optionsStartIndex: netWorthOldOptions.concat(currentOptions).findIndex((value) => value > 0),
      homeEquity: leftPad(homeEquityOld.concat(homeEquityCurrent), totalLength),
      funds: leftPad(fundsOld, oldOffset).concat(fundsCurrent),
      oldOffset,
      cashOther: leftPad(cashOther, totalLength),
      pension: leftPad(pension, totalLength),
    };
  }

  return {
    netWorth: withoutPension,
    options,
    optionsStartIndex,
    homeEquity: homeEquityCurrent,
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
  );

  const lines = [
    {
      key: 'targets',
      data: targets.line,
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
      key: 'options',
      data: dataOptions,
      fill: false,
      smooth: true,
      color: colors.netWorth.options,
      dashed: true,
      strokeWidth: 1,
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
      key: 'balance',
      data: dataNetWorth,
      fill: false,
      smooth: true,
      color: (_: Point, index = 0): string =>
        index < futureIndex - 1
          ? colors[Page.overview].balanceActual
          : colors[Page.overview].balancePredicted,
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
