import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import isBefore from 'date-fns/isBefore';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { getNetWorthSummary } from './net-worth';

import { Average } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import { IDENTITY, arrayAverage, randnBm, getTotalCost, lastInArray } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { withoutDeleted } from '~client/selectors/crud';
import { getFundsRows } from '~client/selectors/funds/helpers';
import { getRawItems } from '~client/selectors/list';
import {
  getCost,
  getSpendingColumn,
  getNumMonths,
  getFutureMonths,
  getMonthDates,
  currentDayIsEndOfMonth,
} from '~client/selectors/overview/common';
import {
  Cost,
  CostProcessed,
  ListItemExtendedNative,
  ListItemStandard,
  ListItemStandardNative,
  Median,
  NativeDate,
  FundNative as Fund,
  OverviewTable,
  OverviewTableRow,
  PageListStandard,
  PageNonStandard,
  SplitRange,
  TableValues,
} from '~client/types';

export * from './common';
export * from './net-worth';

export const getHomeEquityOld = (state: State): number[] =>
  state[PageNonStandard.Overview].homeEquityOld;

const futureCategories: (keyof (Cost & Pick<CostProcessed, 'fundsOld'>))[] = [
  PageNonStandard.Funds,
  PageListStandard.Food,
  PageListStandard.General,
  PageListStandard.Holiday,
  PageListStandard.Social,
];

const separateOldFunds = (numRows: number) => (
  data: Cost,
): Cost & Pick<CostProcessed, 'fundsOld'> =>
  data[PageNonStandard.Funds].length > numRows
    ? {
        ...data,
        [PageNonStandard.Funds]: data[PageNonStandard.Funds].slice(-numRows),
        fundsOld: data[PageNonStandard.Funds].slice(0, -numRows),
      }
    : { ...data, fundsOld: [] };

export const getAnnualisedFundReturns = (state: State): number =>
  state.overview.annualisedFundReturns;

const predictCompoundInterest = (annualRate: number, jitter = 0) => (last: number[]): number[] => [
  ...last,
  Math.round((lastInArray(last) as number) * (1 + (annualRate + randnBm() * jitter)) ** (1 / 12)),
];

type Category = keyof (Cost & Pick<CostProcessed, 'fundsOld'>);

const extrapolateCurrentMonthColumns: Category[] = [PageListStandard.Food, PageListStandard.Social];

function predictByPastAverages(
  category: Category,
  cost: number[],
  futureMonths: number,
  currentMonthRatio: number,
  currentIndex: number,
): number[] {
  const currentItems = extrapolateCurrentMonthColumns.includes(category)
    ? replaceAtIndex(
        cost.slice(0, -futureMonths),
        currentIndex,
        Math.round(cost[currentIndex] * currentMonthRatio),
      )
    : cost.slice(0, -futureMonths);

  const average = Math.round(arrayAverage(currentItems, Average.Median));

  return currentItems.concat(Array(futureMonths).fill(average));
}

function predictCategory(
  cost: number[],
  category: Category,
  futureMonths: number,
  currentMonthRatio: number,
  index: number,
  annualisedFundReturns: number,
): number[] {
  if (!futureCategories.includes(category)) {
    return cost;
  }
  if (category === PageNonStandard.Funds) {
    return cost
      .slice(index + 1)
      .reduce(predictCompoundInterest(annualisedFundReturns, 0.01), cost.slice(0, index + 1));
  }

  return predictByPastAverages(category, cost, futureMonths, currentMonthRatio, index);
}

function calculateFutures(
  numRows: number,
  currentDate: Date,
  futureMonths: number,
  annualisedFundReturns: number,
): (cost: Cost & Pick<CostProcessed, 'fundsOld'>) => Cost & Pick<CostProcessed, 'fundsOld'> {
  if (futureMonths <= 0) {
    return IDENTITY;
  }

  const currentMonthRatio = getDaysInMonth(currentDate) / getDate(currentDate);

  return (cost): Cost & Pick<CostProcessed, 'fundsOld'> =>
    (Object.keys(cost) as Exclude<
      keyof (Cost & Pick<CostProcessed, 'fundsOld'>),
      '__typename'
    >[]).reduce(
      (last, category) => ({
        ...last,
        [category]: predictCategory(
          cost[category],
          category,
          futureMonths,
          currentMonthRatio,
          numRows - 1 - futureMonths,
          annualisedFundReturns,
        ),
      }),
      {} as Cost & Pick<CostProcessed, 'fundsOld'>,
    );
}

const getNetCashFlow = <K extends keyof CostProcessed>(dates: Date[]) => (
  data: Cost & Pick<CostProcessed, K> & Pick<CostProcessed, 'spending'>,
): Cost & Pick<CostProcessed, K> & Pick<CostProcessed, 'spending' | 'net'> => ({
  ...data,
  net: dates.map((_, index) => data.income[index] - data.spending[index]),
});

const getPredictedNetWorth = <K extends keyof CostProcessed>(
  dates: Date[],
  currentDate: Date,
  netWorth: number[],
  fundsRows: Fund[],
) => (
  data: Cost & Pick<CostProcessed, K> & Pick<CostProcessed, 'net' | 'netWorth'>,
): Cost &
  Pick<CostProcessed, K> &
  Pick<CostProcessed, 'net' | 'netWorth' | 'netWorthPredicted'> => {
  const fundCosts = dates.map((monthDate) =>
    fundsRows.reduce(
      (sum, { transactions }) =>
        sum + getTotalCost((transactions ?? []).filter(({ date }) => isSameMonth(date, monthDate))),
      0,
    ),
  );

  const endOfCurrentMonth = endOfMonth(currentDate);
  const futureStart = currentDayIsEndOfMonth(currentDate)
    ? addMonths(endOfCurrentMonth, 1)
    : endOfCurrentMonth;

  return {
    ...data,
    netWorthPredicted: dates.reduce((values: number[], _, index): number[] => {
      if (index === 0) {
        return [...values, netWorth[index]];
      }

      const future = dates[index] > futureStart;

      const netChange =
        data.net[index] + data.funds[index] - data.funds[index - 1] - fundCosts[index];

      if (future) {
        return [...values, values[values.length - 1] + netChange];
      }

      return [...values, netWorth[index - 1] + netChange];
    }, []),
  };
};

const getCombinedNetWorth = <K extends keyof CostProcessed>(
  currentDate: Date,
  futureMonths: number,
  netWorth: number[],
) => (
  table: Cost & Pick<CostProcessed, K> & Pick<CostProcessed, 'netWorth' | 'netWorthPredicted'>,
): Cost &
  Pick<CostProcessed, K> &
  Pick<CostProcessed, 'netWorth' | 'netWorthPredicted' | 'netWorthCombined'> => {
  const includeThisMonth = isSameDay(endOfMonth(currentDate), currentDate) ? 0 : 1;

  const slice = -(futureMonths + includeThisMonth);

  return {
    ...table,
    netWorthCombined: [...netWorth.slice(0, slice), ...table.netWorthPredicted.slice(slice)],
  };
};

const withNetWorth = <K extends keyof CostProcessed>(
  dates: Date[],
  currentDate: Date,
  futureMonths: number,
  netWorth: number[],
  fundsRows: Fund[],
) => (
  cost: Cost & Pick<CostProcessed, K | 'spending' | 'net'>,
): Cost &
  Pick<CostProcessed, K> &
  Pick<CostProcessed, 'spending' | 'net' | 'netWorth' | 'netWorthPredicted' | 'netWorthCombined'> =>
  compose(
    getCombinedNetWorth<K | 'spending' | 'net'>(currentDate, futureMonths, netWorth),
    getPredictedNetWorth<K | 'spending' | 'net'>(dates, currentDate, netWorth, fundsRows),
    (data: typeof cost) => ({ ...data, netWorth }),
  )(cost);

const withSavingsRatio = (dates: Date[]) => (
  cost: Cost & Pick<CostProcessed, 'fundsOld' | 'spending'>,
): Cost & Pick<CostProcessed, 'fundsOld' | 'spending' | 'savingsRatio'> => ({
  ...cost,
  savingsRatio: dates.map((_, index) =>
    cost.income[index] ? Math.max(0, 1 - cost.spending[index] / cost.income[index]) : 0,
  ),
});

const withPredictedSpending = (
  dates: Date[],
  currentDate: Date,
  futureMonths: number,
  numRows: number,
  annualisedFundReturns: number,
) => (cost: Cost): Cost & Pick<CostProcessed, 'fundsOld' | 'spending' | 'savingsRatio'> =>
  compose(
    withSavingsRatio(dates),
    getSpendingColumn<'fundsOld'>(dates),
    calculateFutures(numRows, currentDate, futureMonths, annualisedFundReturns),
    separateOldFunds(numRows),
  )(cost);

export const getProcessedCost = moize(
  (today: Date): ((state: State) => CostProcessed) =>
    createSelector(
      getNumMonths,
      getFutureMonths(today),
      getMonthDates,
      getNetWorthSummary,
      getFundsRows,
      getAnnualisedFundReturns,
      getCost,
      (numRows, futureMonths, dates, netWorth, fundsRows, annualisedFundReturns, costMap) =>
        compose(
          withNetWorth<'fundsOld' | 'savingsRatio' | 'spending'>(
            dates,
            today,
            futureMonths,
            netWorth,
            fundsRows,
          ),
          getNetCashFlow<'fundsOld' | 'savingsRatio'>(dates),
          withPredictedSpending(dates, today, futureMonths, numRows, annualisedFundReturns),
        )(costMap),
    ),
  { maxSize: 1 },
);

const getPageCostForMonthSoFar = <I extends NativeDate<ListItemStandard, 'date'>>(
  today: Date,
  items: CrudState<I>,
): number =>
  withoutDeleted(items)
    .filter(({ date }) => isSameMonth(date, today) && isBefore(date, today))
    .reduce<number>((last, { cost }) => last + cost, 0);

export const getCostForMonthSoFar = moize(
  (today: Date) =>
    createSelector<
      State,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      CrudState<ListItemStandardNative>,
      number
    >(
      getRawItems<ListItemStandardNative, PageListStandard.Income>(PageListStandard.Income),
      getRawItems<ListItemStandardNative, PageListStandard.Bills>(PageListStandard.Bills),
      getRawItems<ListItemExtendedNative, PageListStandard.Food>(PageListStandard.Food),
      getRawItems<ListItemExtendedNative, PageListStandard.General>(PageListStandard.General),
      getRawItems<ListItemExtendedNative, PageListStandard.Holiday>(PageListStandard.Holiday),
      getRawItems<ListItemExtendedNative, PageListStandard.Social>(PageListStandard.Social),
      (income, ...args) =>
        args.reduce(
          (last, items) => last + getPageCostForMonthSoFar(today, items),
          -getPageCostForMonthSoFar(today, income),
        ),
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

type TableNumberRows = TableValues<number[], 'netWorth'>;

const getTableValues = (cost: CostProcessed, netWorth: number[]): TableNumberRows =>
  OVERVIEW_COLUMNS.reduce<TableNumberRows>(
    (last, [key]) => ({
      [key]: cost[key as keyof TableValues],
      ...last,
    }),
    {
      netWorth,
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

const getCells = (cost: CostProcessed, getColor: ReturnType<typeof getCellColor>) => (
  index: number,
): OverviewTableRow['cells'] =>
  OVERVIEW_COLUMNS.reduce<OverviewTableRow['cells']>(
    (last, [column]) => ({
      ...last,
      [column]: {
        value: cost[column][index],
        rgb: getColor(cost[column][index], column),
      },
    }),
    {} as OverviewTableRow['cells'],
  );

export const getOverviewTable = moize(
  (today: Date): ((state: State) => OverviewTable) =>
    createSelector(
      getMonthDates,
      getFutureMonths(today),
      getProcessedCost(today),
      getNetWorthSummary,
      (dates, futureMonths, cost, netWorth): OverviewTable => {
        const months = getFormattedMonths(dates);
        const values = getTableValues(cost, netWorth);
        const scoreValues = getScoreValues(values, futureMonths);
        const ranges = getRanges(values, scoreValues);
        const medians = getMedians(values, scoreValues);
        const endOfCurrentMonth = endOfMonth(today);

        const getRowCells = getCells(cost, getCellColor(ranges, medians));

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
