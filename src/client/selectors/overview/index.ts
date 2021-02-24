import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
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

import {
  getMonthlyValues,
  getSpendingColumn,
  getFutureMonths,
  getMonthDates,
  roundedArrays,
} from './common';
import {
  calculatePredictedSAYEMonthlyDeposit,
  EntryWithFTI,
  getDerivedNetWorthEntries,
  getHomeEquity,
  getStartPredictionIndex,
  getSubcategories,
  HomeEquity,
} from './net-worth';

import { Average } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import { arrayAverage, getTotalCost, IDENTITY, randnBm, rightPad } from '~client/modules/data';
import { State } from '~client/reducers';
import { filterPastTransactions, getFundsCachedValue } from '~client/selectors/funds';
import { getFundsRows } from '~client/selectors/funds/helpers';
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
import type { Monthly, NetWorthSubcategory } from '~client/types/gql';
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
  netWorth: EntryWithFTI[],
  homeEquity: HomeEquity[],
  funds: Fund[],
) => (
  monthly: MonthlyWithProcess<K | 'spending' | 'cashOther'>,
): MonthlyWithProcess<K | 'spending' | 'cashOther'> &
  Pick<MonthlyProcessed, 'netWorth' | 'assets' | 'liabilities' | 'homeEquity'> => {
  const assets = netWorth.reduce<number[]>((last, entry, index) => {
    if (index < startPredictionIndex) {
      return [...last, entry.assets];
    }

    const income = monthly.income[index];
    const spending = monthly.spending[index];
    const stockReturn = monthly.stocks[index] - monthly.stocks[index - 1];

    const stockTransactionCost =
      index === startPredictionIndex
        ? funds.reduce<number>(
            (sum, { transactions }) =>
              sum +
              getTotalCost(
                transactions.filter(({ date }) => isSameMonth(date, netWorth[index].date)),
              ),
            0,
          )
        : 0;

    const homeValueChange = homeEquity[index].value - homeEquity[index - 1].value;
    const otherCashChange = monthly.cashOther[index] - monthly.cashOther[index - 1];

    const netChange =
      income - spending + stockReturn - stockTransactionCost + homeValueChange + otherCashChange;

    return [...last, last[last.length - 1] + netChange];
  }, []);

  const liabilities = netWorth.reduce<number[]>((last, entry, index) => {
    if (index < startPredictionIndex) {
      return [...last, -entry.liabilities];
    }
    const homeDebtChange = homeEquity[index].debt - homeEquity[index - 1].debt;
    return [...last, last[last.length - 1] + homeDebtChange];
  }, []);

  return {
    ...monthly,
    assets,
    liabilities,
    netWorth: assets.map((value, index) => value + liabilities[index]),
    homeEquity: homeEquity.map(({ value, debt }) => value + debt),
  };
};

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

  return futureMonths > 0 ? currentItems.concat(Array(futureMonths).fill(average)) : currentItems;
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
  futureMonths > 0
    ? Array(futureMonths)
        .fill(0)
        .reduce<number[]>(
          (last) => [
            ...last,
            last[last.length - 1] * (1 + (annualisedFundReturns + randnBm() * 0.01)) ** (1 / 12),
          ],
          stocks,
        )
        .map(Math.round)
    : stocks;

const withCurrentStockValue = (futureMonths: number, currentStockValue: number) => (
  stocks: number[],
): number[] => replaceAtIndex(stocks, stocks.length - 1 - futureMonths, currentStockValue);

const withStocks = <K extends MonthlyProcessedKey>(
  dates: Date[],
  funds: Fund[],
  numOldMonths: number,
  futureMonths: number,
  currentStockValue: number,
  annualisedFundReturns: number,
) => (
  monthly: MonthlyWithProcess<K>,
): MonthlyWithProcess<K> & Pick<MonthlyProcessed, 'stockCostBasis'> => ({
  ...monthly,
  stocks: compose(
    withCurrentStockValue(futureMonths, Math.round(currentStockValue)),
    predictStockReturns(futureMonths, annualisedFundReturns),
  )(monthly.stocks),
  stockCostBasis: Array(numOldMonths + dates.length)
    .fill(0)
    .map<Date>((_, index) => endOfMonth(addMonths(dates[0], index - numOldMonths)))
    .map<number>((monthDate) =>
      funds.reduce<number>(
        (last, fund) => last + getTotalCost(filterPastTransactions(monthDate, fund.transactions)),
        0,
      ),
    ),
});

type AggregateKey = 'pension' | 'cashOther' | 'options' | 'investments';

function withAggregateNetWorth(
  today: Date,
  startPredictionIndex: number,
  subcategories: NetWorthSubcategory[],
  aggregatedNetWorth: EntryWithFTI[],
): (monthly: Monthly) => MonthlyWithProcess<AggregateKey> {
  const currentEntries = aggregatedNetWorth.slice(0, startPredictionIndex);
  const fillCurrent = (values: number[]): number[] => rightPad(values, aggregatedNetWorth.length);
  const fillAggregate = (key: Aggregate): number[] =>
    fillCurrent(currentEntries.map(({ aggregate }) => aggregate[key]));

  const { deposit: sayeDeposit, profit: sayeProfit } = calculatePredictedSAYEMonthlyDeposit(
    subcategories,
    aggregatedNetWorth,
    startPredictionIndex,
  );

  return (monthly: Monthly): MonthlyWithProcess<AggregateKey> => ({
    ...monthly,
    pension: fillAggregate(Aggregate.pension),
    cashOther: fillAggregate(Aggregate.cashOther).map(
      (value, index) => value + sayeDeposit * Math.max(0, index - (startPredictionIndex - 1)),
    ),
    investments: fillAggregate(Aggregate.stocks),
    options: fillCurrent(currentEntries.map(({ options }) => options)).map(
      (value, index) => value + sayeProfit * Math.max(0, index - (startPredictionIndex - 1)),
    ),
  });
}

export const getProcessedMonthlyValues = moize(
  (
    today: Date,
    numOldMonths: number,
  ): ((state: State) => { values: MonthlyProcessed; startPredictionIndex: number }) =>
    createSelector(
      getStartPredictionIndex(today),
      getFutureMonths(today),
      getMonthDates,
      getSubcategories,
      getDerivedNetWorthEntries,
      getFundsRows,
      getFundsCachedValue.today(today),
      getAnnualisedFundReturns,
      getMonthlyValues,
      getHomeEquity(today),
      (
        startPredictionIndex,
        futureMonths,
        dates,
        subcategories,
        netWorth,
        funds,
        fundsCachedValue,
        annualisedFundReturns,
        monthly,
        homeEquity,
      ) => {
        const values = compose(
          withNetWorth<AggregateKey | 'stockCostBasis' | 'spending' | 'net'>(
            startPredictionIndex,
            netWorth,
            homeEquity,
            funds,
          ),
          withPredictedSpending<AggregateKey | 'stockCostBasis'>(dates, today, futureMonths),
          withStocks<AggregateKey>(
            dates,
            funds,
            numOldMonths,
            futureMonths,
            fundsCachedValue.value,
            annualisedFundReturns,
          ),
          withAggregateNetWorth(today, startPredictionIndex, subcategories, netWorth),
        )(monthly);
        return { values: roundedArrays<MonthlyProcessed>(values), startPredictionIndex };
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
      netWorth: monthly.netWorth,
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

const getCells = (
  monthly: Omit<MonthlyProcessed, 'startPredictionIndex'>,
  getColor: ReturnType<typeof getCellColor>,
) => (index: number): OverviewTableRow['cells'] =>
  OVERVIEW_COLUMNS.reduce<OverviewTableRow['cells']>(
    (
      last,
      [
        key,
        { include = [key as keyof Omit<MonthlyProcessed, 'startPredictionIndex'>], exclude = [] },
      ],
    ) => {
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
      getProcessedMonthlyValues(today, 0),
      (dates, futureMonths, monthly): OverviewTable => {
        const months = getFormattedMonths(dates);
        const values = getTableValues(monthly.values);
        const scoreValues = getScoreValues(values, futureMonths);
        const ranges = getRanges(values, scoreValues);
        const medians = getMedians(values, scoreValues);
        const endOfCurrentMonth = endOfMonth(today);

        const getRowCells = getCells(monthly.values, getCellColor(ranges, medians));

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
