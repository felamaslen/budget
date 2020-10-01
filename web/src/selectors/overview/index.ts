import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { getNetWorthSummary } from './net-worth';

import { Average } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import { IDENTITY, arrayAverage, randnBm, getTotalCost } from '~client/modules/data';
import { State } from '~client/reducers';
import { getFundsRows } from '~client/selectors/funds/helpers';
import {
  getCost,
  getSpendingColumn,
  getNumMonths,
  getFutureMonths,
  getMonthDates,
} from '~client/selectors/overview/common';
import {
  Page,
  Cost,
  CostProcessed,
  TableValues,
  SplitRange,
  Median,
  OverviewTable as Table,
  OverviewTableRow as TableRow,
  Fund,
  OverviewTableRow,
} from '~client/types';

export * from './common';
export * from './net-worth';

const futureCategories: (keyof (Cost & Pick<CostProcessed, 'fundsOld'>))[] = [
  Page.funds,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
];

const separateOldFunds = (numRows: number) => (
  data: Cost,
): Cost & Pick<CostProcessed, 'fundsOld'> =>
  data[Page.funds].length > numRows
    ? {
        ...data,
        [Page.funds]: data[Page.funds].slice(-numRows),
        fundsOld: data[Page.funds].slice(0, -numRows),
      }
    : { ...data, fundsOld: [] };

export const getAnnualisedFundReturns = (state: State): number =>
  state.overview.annualisedFundReturns;

const predictCompoundInterest = (annualRate: number, jitter = 0) => (last: number[]): number[] => [
  ...last,
  Math.round(last[last.length - 1] * (1 + (annualRate + randnBm() * jitter)) ** (1 / 12)),
];

function predictByPastAverages(
  cost: number[],
  futureMonths: number,
  currentMonthRatio: number,
  currentIndex: number,
): number[] {
  const currentItems = replaceAtIndex(
    cost.slice(0, -futureMonths),
    currentIndex,
    Math.round(cost[currentIndex] * currentMonthRatio),
  );

  const average = Math.round(arrayAverage(currentItems, Average.Median));

  return currentItems.concat(new Array(futureMonths).fill(average));
}

function predictCategory(
  cost: number[],
  category: keyof (Cost & Pick<CostProcessed, 'fundsOld'>),
  futureMonths: number,
  currentMonthRatio: number,
  index: number,
  annualisedFundReturns: number,
): number[] {
  if (!futureCategories.includes(category)) {
    return cost;
  }
  if (category === Page.funds) {
    return cost
      .slice(index + 1)
      .reduce(predictCompoundInterest(annualisedFundReturns, 0.01), cost.slice(0, index + 1));
  }

  return predictByPastAverages(cost, futureMonths, currentMonthRatio, index);
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
    (Object.keys(cost) as (keyof (Cost & Pick<CostProcessed, 'fundsOld'>))[]).reduce(
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
  data: Cost & Pick<CostProcessed, K | 'spending'>,
): Cost & Pick<CostProcessed, K | 'spending' | 'net'> => ({
  ...data,
  net: dates.map((_, index) => {
    const result = data.income[index] - data.spending[index];
    return result;
  }),
});

const getPredictedNetWorth = <K extends keyof CostProcessed>(
  dates: Date[],
  currentDate: Date,
  netWorth: number[],
  fundsRows: Fund[],
) => (
  data: Cost & Pick<CostProcessed, K | 'net' | 'netWorth'>,
): Cost & Pick<CostProcessed, K | 'net' | 'netWorth' | 'netWorthPredicted'> => {
  const fundCosts = dates.map((monthDate) =>
    fundsRows.reduce(
      (sum, { transactions }) =>
        sum + getTotalCost((transactions ?? []).filter(({ date }) => isSameMonth(date, monthDate))),
      0,
    ),
  );

  const endOfCurrentMonth = endOfMonth(currentDate);
  const futureStart = isSameDay(endOfCurrentMonth, currentDate)
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
  table: Cost & Pick<CostProcessed, K | 'netWorth' | 'netWorthPredicted'>,
): Cost & Pick<CostProcessed, K | 'netWorth' | 'netWorthPredicted' | 'netWorthCombined'> => {
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
  Pick<
    CostProcessed,
    K | 'spending' | 'net' | 'netWorth' | 'netWorthPredicted' | 'netWorthCombined'
  > =>
  compose(
    getCombinedNetWorth<K | 'spending' | 'net'>(currentDate, futureMonths, netWorth),
    getPredictedNetWorth<K | 'spending'>(dates, currentDate, netWorth, fundsRows),
    (
      data: Cost & Pick<CostProcessed, K | 'spending' | 'net'>,
    ): Cost & Pick<CostProcessed, K | 'spending' | 'net' | 'netWorth'> => ({ ...data, netWorth }),
  )(cost);

const withPredictedSpending = (
  dates: Date[],
  currentDate: Date,
  futureMonths: number,
  numRows: number,
  annualisedFundReturns: number,
) => (cost: Cost): Cost & Pick<CostProcessed, 'fundsOld' | 'spending'> =>
  compose(
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
          withNetWorth<'fundsOld' | 'spending'>(dates, today, futureMonths, netWorth, fundsRows),
          getNetCashFlow<'fundsOld'>(dates),
          withPredictedSpending(dates, today, futureMonths, numRows, annualisedFundReturns),
        )(costMap),
    ),
  { maxSize: 1 },
);

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

const getFormattedMonths = (dates: Date[]): string[] => dates.map((date) => format(date, 'LLL-yy'));

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
  (today: Date): ((state: State) => Table) =>
    createSelector(
      getMonthDates,
      getFutureMonths(today),
      getProcessedCost(today),
      getNetWorthSummary,
      (dates, futureMonths, cost, netWorth): Table => {
        const months = getFormattedMonths(dates);
        const values = getTableValues(cost, netWorth);
        const scoreValues = getScoreValues(values, futureMonths);
        const ranges = getRanges(values, scoreValues);
        const medians = getMedians(values, scoreValues);
        const endOfCurrentMonth = endOfMonth(today);

        const getRowCells = getCells(cost, getCellColor(ranges, medians));

        return months.map(
          (month: string, index: number): TableRow => {
            const past = dates[index] < today;
            const future = dates[index] > endOfCurrentMonth;

            return {
              month,
              cells: getRowCells(index),
              past,
              active: !past && !future,
              future,
            };
          },
        );
      },
    ),
  {
    maxSize: 1,
  },
);
