import { compose } from '@typed/compose';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { EntryWithFTI, getDerivedNetWorthEntries, getHomeEquity } from './net-worth';

import { Average } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import { arrayAverage, getTotalCost, IDENTITY, randnBm, rightPad } from '~client/modules/data';
import { State } from '~client/reducers';
import { getFundsCachedValue } from '~client/selectors/funds';
import { getFundsRows } from '~client/selectors/funds/helpers';
import {
  getMonthlyValues,
  getSpendingColumn,
  getFutureMonths,
  getMonthDates,
  currentDayIsEndOfMonth,
} from '~client/selectors/overview/common';
import {
  MonthlyProcessed,
  Median,
  FundNative as Fund,
  OverviewTable,
  OverviewTableRow,
  SplitRange,
  TableValues,
  MonthlyProcessedKey,
  MonthlyWithProcess,
  Aggregate,
  GQL,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { Monthly } from '~client/types/gql';
import type {} from '~client/types/overview';

export * from './common';
export * from './net-worth';

type Category = keyof GQL<Monthly>;

const futureCategories: Category[] = [
  PageListStandard.Food,
  PageListStandard.General,
  PageListStandard.Holiday,
  PageListStandard.Social,
];

const extrapolateCurrentMonthCategories: Category[] = [
  PageListStandard.Food,
  PageListStandard.Social,
];

export const getAnnualisedFundReturns = (state: State): number =>
  state.overview.annualisedFundReturns;

const withNetWorth = <K extends MonthlyProcessedKey>(
  startPredictionIndex: number,
  isEndOfMonth: boolean,
  netWorth: EntryWithFTI[],
  funds: Fund[],
) => (
  monthly: MonthlyWithProcess<K | 'spending' | 'homeEquity'>,
): MonthlyWithProcess<K | 'spending' | 'homeEquity'> & Pick<MonthlyProcessed, 'netWorth'> => ({
  ...monthly,
  netWorth: netWorth
    .map(({ assets, liabilities }) => assets - liabilities)
    .reduce<number[]>((last, value, index) => {
      if (index < startPredictionIndex) {
        return [...last, value];
      }

      const income = monthly.income[index];
      const spending = monthly.spending[index];
      const stockReturn = monthly.stocks[index] - monthly.stocks[index - 1];

      const stockTransactionCost =
        !isEndOfMonth && index === startPredictionIndex
          ? funds.reduce<number>(
              (sum, { transactions }) =>
                sum +
                getTotalCost(
                  transactions.filter(({ date }) => isSameMonth(date, netWorth[index].date)),
                ),
              0,
            )
          : 0;

      const homeEquityChange = monthly.homeEquity[index] - monthly.homeEquity[index - 1];

      const netChange = income - spending + stockReturn - stockTransactionCost + homeEquityChange;

      return [...last, last[last.length - 1] + netChange];
    }, [])
    .map(Math.round),
});

function predictByPastAverages(
  category: Category,
  cost: number[],
  futureMonths: number,
  currentMonthRatio: number,
  currentIndex: number,
): number[] {
  const currentItems = extrapolateCurrentMonthCategories.includes(category)
    ? replaceAtIndex(
        cost.slice(0, -futureMonths),
        currentIndex,
        Math.round(cost[currentIndex] * currentMonthRatio),
      )
    : cost.slice(0, -futureMonths);

  const average = Math.round(arrayAverage(currentItems, Average.Median));

  return currentItems.concat(Array(futureMonths).fill(average));
}

function calculateFutures<K extends MonthlyProcessedKey>(
  numRows: number,
  today: Date,
  futureMonths: number,
): (monthly: MonthlyWithProcess<K>) => MonthlyWithProcess<K> {
  if (futureMonths <= 0) {
    return IDENTITY;
  }

  const currentMonthRatio = getDaysInMonth(today) / getDate(today);

  return (monthly): MonthlyWithProcess<K> =>
    futureCategories.reduce<MonthlyWithProcess<K>>(
      (last, category) => ({
        ...last,
        [category]: predictByPastAverages(
          category,
          monthly[category],
          futureMonths,
          currentMonthRatio,
          numRows - 1 - futureMonths,
        ),
      }),
      monthly,
    );
}

const withNetChange = <K extends MonthlyProcessedKey>() => (
  monthly: MonthlyWithProcess<K> & Pick<MonthlyProcessed, 'spending'>,
): MonthlyWithProcess<K> & Pick<MonthlyProcessed, 'spending' | 'net'> => ({
  ...monthly,
  net: monthly.income.map((value, index) => value - monthly.spending[index]),
});

const withPredictedSpending = <K extends MonthlyProcessedKey>(
  dates: Date[],
  today: Date,
  futureMonths: number,
) => (
  monthly: MonthlyWithProcess<K>,
): MonthlyWithProcess<K> & Pick<MonthlyProcessed, 'spending' | 'net'> =>
  compose(
    withNetChange<K>(),
    getSpendingColumn<K>(dates),
    calculateFutures<K>(dates.length, today, futureMonths),
  )(monthly);

const predictStockReturns = (futureMonths: number, annualisedFundReturns: number) => (
  stocks: number[],
): number[] =>
  stocks
    .slice(stocks.length - futureMonths)
    .reduce<number[]>(
      (last) => [
        ...last,
        last[last.length - 1] * (1 + (annualisedFundReturns + randnBm() * 0.01)) ** (1 / 12),
      ],
      stocks.slice(0, stocks.length - futureMonths),
    )
    .map(Math.round);

const withCurrentStockValue = (futureMonths: number, currentStockValue: number) => (
  stocks: number[],
): number[] => replaceAtIndex(stocks, stocks.length - 1 - futureMonths, currentStockValue);

const withStocks = <K extends MonthlyProcessedKey>(
  futureMonths: number,
  currentStockValue: number,
  annualisedFundReturns: number,
) => (monthly: MonthlyWithProcess<K>): MonthlyWithProcess<K> => ({
  ...monthly,
  stocks: compose(
    withCurrentStockValue(futureMonths, currentStockValue),
    predictStockReturns(futureMonths, annualisedFundReturns),
  )(monthly.stocks),
});

type AggregateKey = 'pension' | 'lockedCash' | 'options';

function withAggregateNetWorth<K extends MonthlyProcessedKey>(
  today: Date,
  startPredictionIndex: number,
  aggregatedNetWorth: EntryWithFTI[],
): (
  monthly: MonthlyWithProcess<K>,
) => MonthlyWithProcess<K> & Pick<MonthlyProcessed, AggregateKey> {
  const currentEntries = aggregatedNetWorth.slice(0, startPredictionIndex);
  const fillCurrent = (values: number[]): number[] => rightPad(values, aggregatedNetWorth.length);
  const fillAggregate = (key: Aggregate): number[] =>
    fillCurrent(currentEntries.map(({ aggregate }) => aggregate[key]));

  return (
    monthly: MonthlyWithProcess<K>,
  ): MonthlyWithProcess<K> & Pick<MonthlyProcessed, AggregateKey> => ({
    ...monthly,
    pension: fillAggregate(Aggregate.pension),
    lockedCash: fillAggregate(Aggregate.cashOther),
    options: fillCurrent(currentEntries.map(({ options }) => options)),
  });
}

export const getProcessedMonthlyValues = moize(
  (today: Date): ((state: State) => MonthlyProcessed) =>
    createSelector(
      getFutureMonths(today),
      getMonthDates,
      getDerivedNetWorthEntries,
      getFundsRows,
      getFundsCachedValue.today(today),
      getAnnualisedFundReturns,
      getMonthlyValues,
      getHomeEquity(today),
      (
        futureMonths,
        dates,
        netWorth,
        funds,
        fundsCachedValue,
        annualisedFundReturns,
        monthly,
        homeEquity,
      ) => {
        const isEndOfMonth = currentDayIsEndOfMonth(today);
        const startPredictionIndex = Math.max(
          1,
          netWorth.length - futureMonths - (isEndOfMonth ? 0 : 1),
        );

        return compose(
          withNetWorth<'homeEquity' | AggregateKey | 'spending' | 'net'>(
            startPredictionIndex,
            isEndOfMonth,
            netWorth,
            funds,
          ),
          withPredictedSpending<'homeEquity' | AggregateKey>(dates, today, futureMonths),
          withStocks<'homeEquity' | AggregateKey>(
            futureMonths,
            fundsCachedValue.value,
            annualisedFundReturns,
          ),
          withAggregateNetWorth<'homeEquity'>(today, startPredictionIndex, netWorth),
        )({ ...monthly, homeEquity });
      },
    ),
  { maxSize: 1 },
);

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

const getFormattedMonths = (
  dates: Date[],
): Pick<OverviewTableRow, 'year' | 'month' | 'monthText'>[] =>
  dates.map((date) => ({
    year: getYear(date),
    month: getMonth(date) + 1,
    monthText: format(date, 'LLL-yy'),
  }));

type TableNumberRows = TableValues<number[], 'netWorth' | 'net'>;

const getTableValues = (monthly: MonthlyProcessed): TableNumberRows =>
  OVERVIEW_COLUMNS.reduce<TableNumberRows>(
    (last, [key]) => ({
      [key]: monthly[key as keyof TableNumberRows],
      ...last,
    }),
    {
      netWorth: monthly.netWorth.map((value, index) => value - monthly.options[index]),
      net: monthly.income.map((value, index) => value - monthly.spending[index]),
    },
  );

const getScoreValues = (values: TableNumberRows, futureMonths: number): TableNumberRows => ({
  ...values,
  netWorth: values.netWorth.slice(0, -(futureMonths + 1)),
});

type Ranges = TableValues<SplitRange>;

const getRanges = (values: TableNumberRows, scoreValues: TableNumberRows): Ranges =>
  (Object.keys(values) as (keyof TableValues)[]).reduce<Ranges>(
    (last, key) => ({
      [key]: {
        min: Math.min(...(Reflect.get(scoreValues, key) ?? [])),
        maxNegative:
          key === 'net' ? 0 : Math.max(...(Reflect.get(scoreValues, key) ?? []).filter(isNegative)),
        minPositive:
          key === 'net' ? 0 : Math.min(...(Reflect.get(scoreValues, key) ?? []).filter(isPositive)),
        max: Math.max(...(Reflect.get(scoreValues, key) ?? [])),
      },
      ...last,
    }),
    {} as Ranges,
  );

type Medians = TableValues<Median>;

const getMedians = (values: TableNumberRows, scoreValues: TableNumberRows): Medians =>
  (Object.keys(values) as (keyof TableValues)[]).reduce<Medians>(
    (last, key) => ({
      ...last,
      [key]: {
        positive: arrayAverage(
          (Reflect.get(scoreValues, key) ?? []).filter(isPositive),
          Average.Median,
        ),
        negative: arrayAverage(
          (Reflect.get(scoreValues, key) ?? []).filter(isNegative),
          Average.Median,
        ),
      },
    }),
    {} as Medians,
  );

const getCellColor = (ranges: Ranges, medians: Medians) => (
  value: number,
  key: keyof TableValues,
): string => getOverviewScoreColor(value, ranges[key], medians[key], overviewCategoryColor[key]);

const getCells = (monthly: MonthlyProcessed, getColor: ReturnType<typeof getCellColor>) => (
  index: number,
): OverviewTableRow['cells'] =>
  OVERVIEW_COLUMNS.reduce<OverviewTableRow['cells']>(
    (last, [key, { include = [key as keyof MonthlyProcessed], exclude = [] }]) => {
      const value =
        include.reduce<number>((sum, column) => sum + monthly[column][index], 0) -
        exclude.reduce<number>((sum, column) => sum + monthly[column][index], 0);

      return { ...last, [key]: { value, rgb: getColor(value, key as keyof TableValues) } };
    },
    {} as OverviewTableRow['cells'],
  );

export const getOverviewTable = moize(
  (today: Date): ((state: State) => OverviewTable) =>
    createSelector(
      getMonthDates,
      getFutureMonths(today),
      getProcessedMonthlyValues(today),
      (dates, futureMonths, monthly): OverviewTable => {
        const months = getFormattedMonths(dates);
        const values = getTableValues(monthly);
        const scoreValues = getScoreValues(values, futureMonths);
        const ranges = getRanges(values, scoreValues);
        const medians = getMedians(values, scoreValues);
        const endOfCurrentMonth = endOfMonth(today);

        const getRowCells = getCells(monthly, getCellColor(ranges, medians));

        return months.map<OverviewTableRow>(({ year, month, monthText }, index) => {
          const past = dates[index] < today;
          const future = dates[index] > endOfCurrentMonth;

          return {
            year,
            month,
            monthText,
            cells: getRowCells(index),
            past,
            active: !past && !future,
            future,
          };
        });
      },
    ),
  {
    maxSize: 1,
  },
);
