import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { getNetWorthSummary } from './net-worth';

import { Average } from '~client/constants';
import { OVERVIEW_COLUMNS, OverviewColumn, OverviewHeader } from '~client/constants/data';
import { FUTURE_INVESTMENT_RATE } from '~client/constants/stocks';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~client/modules/color';
import { IDENTITY, arrayAverage, randnBm } from '~client/modules/data';
import { getFundsRows } from '~client/selectors/funds/helpers';
import { getCurrentDate } from '~client/selectors/now';
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
  OverviewCell as Cell,
  Fund,
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

const predictCompoundInterest = (annualRate: number, jitter = 0) => (last: number[]): number[] =>
  last.concat([Math.round(last[last.length - 1] * (1 + annualRate / 12 + randnBm() * jitter))]);

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
): number[] {
  if (!futureCategories.includes(category)) {
    return cost;
  }
  if (category === Page.funds) {
    return cost
      .slice(index + 1)
      .reduce(predictCompoundInterest(FUTURE_INVESTMENT_RATE, 0.01), cost.slice(0, index + 1));
  }

  return predictByPastAverages(cost, futureMonths, currentMonthRatio, index);
}

function calculateFutures(
  numRows: number,
  currentDate: Date,
  futureMonths: number,
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
        (transactions ?? [])
          .filter(({ date }) => isSameMonth(date, monthDate))
          .reduce((last, { cost }) => last + cost, sum),
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
) => (cost: Cost): Cost & Pick<CostProcessed, 'fundsOld' | 'spending'> =>
  compose(
    getSpendingColumn<'fundsOld'>(dates),
    calculateFutures(numRows, currentDate, futureMonths),
    separateOldFunds(numRows),
  )(cost);

export const getProcessedCost = createSelector(
  getCurrentDate,
  getNumMonths,
  getFutureMonths,
  getMonthDates,
  getNetWorthSummary,
  getFundsRows,
  getCost,
  (currentDate, numRows, futureMonths, dates, netWorth, fundsRows, costMap) =>
    compose(
      withNetWorth<'fundsOld' | 'spending'>(dates, currentDate, futureMonths, netWorth, fundsRows),
      getNetCashFlow<'fundsOld'>(dates),
      withPredictedSpending(dates, currentDate, futureMonths, numRows),
    )(costMap),
);

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

export const getOverviewTable = createSelector(
  getCurrentDate,
  getMonthDates,
  getFutureMonths,
  getProcessedCost,
  getNetWorthSummary,
  (currentDate, dates, futureMonths, cost, netWorth): Table | null => {
    if (!dates) {
      return null;
    }

    const months = dates.map((date) => format(date, 'LLL-yy'));

    const values: TableValues<number[], 'netWorth'> = Object.entries(OVERVIEW_COLUMNS)
      .filter(([header]) => header !== 'month')
      .reduce((last, [key]) => ({ [key]: cost[key as keyof TableValues], ...last }), {
        netWorth,
      });

    const scoreValues: TableValues<number[], 'netWorth'> = {
      ...values,
      netWorth: values.netWorth.slice(0, -(futureMonths + 1)),
    };

    const ranges: TableValues<SplitRange> = (Object.keys(values) as (keyof TableValues)[]).reduce(
      (last, key) => ({
        [key]: {
          min: Math.min(...(Reflect.get(scoreValues, key) ?? [])),
          maxNegative:
            key === 'net'
              ? 0
              : Math.max(...(Reflect.get(scoreValues, key) ?? []).filter(isNegative)),
          minPositive:
            key === 'net'
              ? 0
              : Math.min(...(Reflect.get(scoreValues, key) ?? []).filter(isPositive)),
          max: Math.max(...(Reflect.get(scoreValues, key) ?? [])),
        },
        ...last,
      }),
      {} as TableValues<SplitRange>,
    );

    const medians: TableValues<Median> = (Object.keys(values) as (keyof TableValues)[]).reduce(
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
      {} as TableValues,
    );

    const categoryColor = getOverviewCategoryColor();

    const getColor = (value: number, key: keyof TableValues): string =>
      getOverviewScoreColor(value, ranges[key], medians[key], categoryColor[key]);

    const getCells = (monthText: string, index: number): Cell[] =>
      (Object.entries(OVERVIEW_COLUMNS) as [OverviewHeader, OverviewColumn][]).map(
        ([key, { name: display }]): Cell => {
          const column: Cell['column'] = [key, display];

          if (key === 'month') {
            return {
              column,
              value: monthText,
              rgb: null,
            };
          }

          const value = cost[key][index];

          return {
            column,
            value,
            rgb: getColor(value, key),
          };
        },
      );

    const endOfCurrentMonth = endOfMonth(currentDate);

    return months.map(
      (monthText, index): TableRow => {
        const date = dates[index];
        const past = date < currentDate;
        const future = date > endOfCurrentMonth;
        const active = !past && !future;

        const cells = getCells(monthText, index);

        return {
          key: monthText,
          cells,
          past,
          active,
          future,
        };
      },
    );
  },
);
