import { DateTime } from 'luxon';
import { createSelector } from 'reselect';
import { compose } from '@typed/compose';
import { replaceAtIndex } from 'replace-array';

import { Page } from '~client/types/app';
import { Cost, CostProcessed, TableValues, Range, Median } from '~client/types/overview';
import { LegacyRow as FundRow } from '~client/types/funds';
import { AVERAGE_MEDIAN } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { FUTURE_INVESTMENT_RATE } from '~client/constants/stocks';
import { Color } from '~client/constants/colors';
import { IDENTITY, arrayAverage, randnBm } from '~client/modules/data';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~client/modules/color';
import { getCurrentDate } from '~client/selectors/now';
import {
  getCost,
  getSpendingColumn,
  getNumMonths,
  getFutureMonths,
  getMonthDates,
} from '~client/selectors/overview/common';
import { getFundsRows } from '~client/selectors/funds/helpers';
import { getNetWorthSummary } from './net-worth';

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

  const average = Math.round(arrayAverage(currentItems, AVERAGE_MEDIAN));

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
  currentDate: DateTime,
  futureMonths: number,
): (cost: Cost & Pick<CostProcessed, 'fundsOld'>) => Cost & Pick<CostProcessed, 'fundsOld'> {
  if (futureMonths <= 0) {
    return IDENTITY;
  }

  const currentMonthRatio = currentDate.daysInMonth / currentDate.day;

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

const getNetCashFlow = <K extends keyof CostProcessed>(dates: DateTime[]) => (
  data: Cost & Pick<CostProcessed, K | 'spending'>,
): Cost & Pick<CostProcessed, K | 'spending' | 'net'> => ({
  ...data,
  net: dates.map((_, index) => {
    const result = data.income[index] - data.spending[index];
    return result;
  }),
});

const getPredictedNetWorth = <K extends keyof CostProcessed>(
  dates: DateTime[],
  currentDate: DateTime,
  netWorth: number[],
  fundsRows: FundRow[],
) => (
  data: Cost & Pick<CostProcessed, K | 'net' | 'netWorth'>,
): Cost & Pick<CostProcessed, K | 'net' | 'netWorth' | 'netWorthPredicted'> => {
  const fundCosts = dates.map(monthDate =>
    fundsRows.reduce(
      (sum, { transactions }) =>
        (transactions ?? [])
          .filter(({ date }) => date.hasSame(monthDate, 'month'))
          .reduce((last, { cost }) => last + cost, sum),
      0,
    ),
  );

  const endOfCurrentMonth = currentDate.endOf('month');
  const futureStart = endOfCurrentMonth.hasSame(currentDate, 'day')
    ? endOfCurrentMonth.plus({ months: 1 })
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
  currentDate: DateTime,
  futureMonths: number,
  netWorth: number[],
) => (
  table: Cost & Pick<CostProcessed, K | 'netWorth' | 'netWorthPredicted'>,
): Cost & Pick<CostProcessed, K | 'netWorth' | 'netWorthPredicted' | 'netWorthCombined'> => {
  const includeThisMonth = currentDate.endOf('month').hasSame(currentDate, 'day') ? 0 : 1;

  const slice = -(futureMonths + includeThisMonth);

  return {
    ...table,
    netWorthCombined: [...netWorth.slice(0, slice), ...table.netWorthPredicted.slice(slice)],
  };
};

const withNetWorth = <K extends keyof CostProcessed>(
  dates: DateTime[],
  currentDate: DateTime,
  futureMonths: number,
  netWorth: number[],
  fundsRows: FundRow[],
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
  dates: DateTime[],
  currentDate: DateTime,
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

type Cell = {
  column: ['month' | keyof TableValues, string];
  value: string | number;
  rgb: Color | null;
};

export const getOverviewTable = createSelector(
  [getCurrentDate, getMonthDates, getFutureMonths, getProcessedCost, getNetWorthSummary],
  (currentDate, dates, futureMonths, cost, netWorth) => {
    if (!dates) {
      return null;
    }

    const months = dates.map(date => date.toFormat('LLL-yy'));

    const values: TableValues<number[]> = OVERVIEW_COLUMNS.slice(1).reduce(
      (last, [key]) => ({ [key]: cost[key as keyof TableValues], ...last }),
      {
        netWorth,
      },
    );

    const scoreValues: TableValues<number[]> = {
      ...values,
      netWorth: values.netWorth.slice(0, -(futureMonths + 1)),
    };

    const ranges: TableValues<Range> = (Object.keys(values) as (keyof TableValues)[]).reduce(
      (last, key) => ({
        [key]: {
          min: Math.min(...(scoreValues[key] ?? [])),
          maxNegative: key === 'net' ? 0 : Math.max(...(scoreValues[key] ?? []).filter(isNegative)),
          minPositive: key === 'net' ? 0 : Math.min(...(scoreValues[key] ?? []).filter(isPositive)),
          max: Math.max(...(scoreValues[key] ?? [])),
        },
        ...last,
      }),
      {} as TableValues<Range>,
    );

    const medians: TableValues<Median> = (Object.keys(values) as (keyof TableValues)[]).reduce(
      (last, key) => ({
        ...last,
        [key]: {
          positive: arrayAverage((scoreValues[key] ?? []).filter(isPositive), AVERAGE_MEDIAN),
          negative: arrayAverage((scoreValues[key] ?? []).filter(isNegative), AVERAGE_MEDIAN),
        },
      }),
      {} as TableValues,
    );

    const categoryColor = getOverviewCategoryColor();

    const getColor = (value: number, key: keyof TableValues): Color =>
      getOverviewScoreColor(
        value,
        ranges[key] as Range,
        medians[key] as Median,
        categoryColor[key] as Color,
      );

    const getCells = (monthText: string, index: number): Cell[] =>
      OVERVIEW_COLUMNS.map(
        ([key, display]): Cell => {
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

    const endOfCurrentMonth = currentDate.endOf('month');

    return months.map((monthText, index) => {
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
    });
  },
);
