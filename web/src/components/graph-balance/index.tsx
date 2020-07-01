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
} from '~client/selectors';
import { graphOverviewHeightMobile, colors } from '~client/styled/variables';
import { Page, Point, Line, Data, CostProcessed, NetWorthTableRow, Aggregate } from '~client/types';

type BalanceData = {
  balance: number[];
  options: number[];
  optionsStartIndex: number;
  funds: number[];
  oldOffset: number;
  cashOther: number[];
  pension: number[];
};

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

function getData(
  netWorthCombined: number[],
  netWorthOldMain: number[],
  netWorthOldOptions: number[],
  netWorth: NetWorthTableRow[],
  fundsCurrent: number[],
  fundsOld: number[],
  showAll: boolean,
): BalanceData {
  const currentOptions = netWorth.map(({ options }) => options);
  const optionsStartIndex = currentOptions.findIndex((value) => value > 0);
  const options = rightPad(currentOptions, netWorthCombined.length).map(
    (value, index) => value + netWorthCombined[index],
  );

  // value of "stocks" section that isn't accounted for by stock value
  const ISACash = fillAggregate(netWorthCombined.length, netWorth, Aggregate.stocks, false).map(
    (value, index) => value - fundsCurrent[index],
  );

  const lastISACash = ISACash[ISACash.length - 1] ?? 0;
  const cashOther = fillAggregate(netWorthCombined.length, netWorth, Aggregate.cashOther).map(
    (value, index) => value + (ISACash[index] ?? lastISACash),
  );

  const pension = fillAggregate(netWorthCombined.length, netWorth, Aggregate.pension);

  const withoutPension = netWorthCombined.map((value, index) => value - pension[index]);

  if (showAll) {
    const oldOffset = Math.max(fundsOld.length, netWorthOldMain.length, netWorthOldOptions.length);
    const totalLength = oldOffset + netWorthCombined.length;
    const balance = leftPad(netWorthOldMain.concat(withoutPension), totalLength);

    const fundsOldPadded = leftPad(fundsOld, oldOffset);

    const optionsFull = leftPad(
      netWorthOldOptions.map((value, index) => value + netWorthOldMain[index]),
      oldOffset,
    ).concat(options);

    return {
      balance,
      options: optionsFull,
      optionsStartIndex: netWorthOldOptions.concat(currentOptions).findIndex((value) => value > 0),
      funds: fundsOldPadded.concat(fundsCurrent),
      oldOffset,
      cashOther: leftPad(cashOther, totalLength),
      pension: leftPad(pension, totalLength),
    };
  }

  return {
    balance: withoutPension,
    options,
    optionsStartIndex,
    funds: fundsCurrent,
    oldOffset: 0,
    cashOther,
    pension,
  };
}

type RawData = {
  startDate: Date;
  cost: CostProps;
  netWorthOldMain: number[];
  netWorthOldOptions: number[];
  netWorth: NetWorthTableRow[];
  showAll: boolean;
  futureMonths: number;
};

function processData({
  startDate,
  cost: { netWorthCombined, funds: fundsCurrent, fundsOld },
  netWorthOldMain,
  netWorthOldOptions,
  netWorth,
  showAll,
  futureMonths,
}: RawData): { lines: Line[]; targetValues: TargetValue[] } {
  const { balance, options, optionsStartIndex, funds, oldOffset, cashOther, pension } = getData(
    netWorthCombined,
    netWorthOldMain,
    netWorthOldOptions,
    netWorth,
    fundsCurrent,
    fundsOld,
    showAll,
  );

  const futureKey = oldOffset + netWorthCombined.length - futureMonths;

  const opts = { oldOffset, startDate };

  const dataBalance = getValuesWithTime(balance, opts);
  const dataOptions =
    optionsStartIndex === -1
      ? []
      : getValuesWithTime(options, opts).slice(Math.max(0, optionsStartIndex - 1));
  const dataCashOther = getValuesWithTime(cashOther, opts);
  const dataPension = getValuesWithTime(pension, { oldOffset, startDate });

  const dataFunds: Data = funds.map((value, index) => [dataBalance[index][0], value]);

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
      stack: dataBalance,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.pension], 0.5),
    },
    {
      key: 'balance',
      data: dataBalance,
      fill: false,
      smooth: true,
      color: (_: Point, index = 0): string =>
        index < futureKey - 1
          ? colors[Page.overview].balanceActual
          : colors[Page.overview].balancePredicted,
    },
    {
      key: 'cash-locked',
      data: dataCashOther,
      stack: dataFunds,
      fill: true,
      smooth: true,
      color: rgba(colors.netWorth.aggregate[Aggregate.cashOther], 0.4),
    },
    {
      key: 'funds',
      data: dataFunds,
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
      <Key title="Balance" />
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
  const netWorthOld = useSelector(getNetWorthSummaryOld, isNetWorthSummaryOldEqual);
  const netWorth = useSelector(getNetWorthTable);
  const futureMonths = useSelector(getFutureMonths(today));
  const cost = useSelector(getProcessedCost(today));

  const [showAll, setShowAll] = useState(false);
  const { lines, targetValues } = useMemo(
    () =>
      processData({
        startDate,
        cost,
        netWorthOldMain: netWorthOld.main,
        netWorthOldOptions: netWorthOld.options,
        netWorth,
        showAll,
        futureMonths,
      }),
    [startDate, cost, netWorthOld.main, netWorthOld.options, netWorth, showAll, futureMonths],
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
