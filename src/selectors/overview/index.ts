import { createSelector, OutputSelector } from 'reselect';
import { compose } from '@typed/compose';
import endOfMonth from 'date-fns/endOfMonth';
import isSameDay from 'date-fns/isSameDay';
import addMonths from 'date-fns/addMonths';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import getDate from 'date-fns/getDate';
import format from 'date-fns/format';

import { Summary, ProcessedSummary, TableColumns, TableCell, Table } from '~/types/overview';
import { OVERVIEW_COLUMNS, FUTURE_INVESTMENT_RATE } from '~/constants/overview';
import { identity } from '~/modules/utils';
import { randnBm } from '~/modules/brownian-motion';
import { AVERAGE_MEDIAN, average, replaceAtIndex, pad } from '~/modules/array';
import { getOverviewScoreColor, getOverviewCategoryColor } from '~/modules/color';
import { getCurrentDate } from '~/selectors/now';
import {
  State,
  spendingCategories,
  getSummary,
  getNumMonths,
  getOldMonths,
  getPastMonths,
  getFutureMonths,
  getMonthDates,
} from '~/selectors/overview/common';
import { getNetWorthSummary } from '~/selectors/overview/net-worth';

const futureCategories = ['funds', 'food', 'general', 'holiday', 'social'];

function separateOldFunds(
  oldMonths: number,
  pastMonths: number,
  futureMonths: number,
): (data: Summary) => Summary {
  return (data: Summary): Summary => ({
    ...data,
    funds: data.funds.slice(oldMonths),
    fundsOld: data.funds.slice(0, oldMonths),
    fundCosts: pad(
      data.fundCosts.slice(oldMonths),
      oldMonths + pastMonths + 1 + futureMonths,
      data.fundCosts[oldMonths + pastMonths] || 0,
    ),
    fundCostsOld: data.fundCosts.slice(0, oldMonths),
  });
}

const predictCompoundInterest = (
  annualRate: number,
  jitter = 0,
): ((last: number[]) => number[]) => (last: number[]): number[] => [
  ...last,
  Math.round(last[last.length - 1] * (1 + annualRate / 12 + randnBm() * jitter)),
];

function predictByPastAverages(
  column: number[],
  pastMonths: number,
  futureMonths: number,
  currentMonthRatio: number,
): number[] {
  const currentItems = replaceAtIndex<number>(
    column.slice(0, pastMonths + 1),
    pastMonths,
    Math.round(column[pastMonths] * currentMonthRatio),
  );

  const predictedValue = Math.round(average(currentItems, AVERAGE_MEDIAN));

  return currentItems.concat(new Array(futureMonths).fill(predictedValue));
}

function predictCategory(
  column: number[],
  category: string,
  pastMonths: number,
  futureMonths: number,
  currentMonthRatio: number,
): number[] {
  if (['fundsOld', 'fundCostsOld'].includes(category)) {
    return column;
  }

  if (category === 'funds') {
    if (!futureMonths) {
      return column;
    }

    return new Array(futureMonths)
      .fill(0)
      .reduce(
        predictCompoundInterest(FUTURE_INVESTMENT_RATE, 0.01),
        column.slice(0, pastMonths + 1),
      );
  }

  const zeroedColumn = pad(column, pastMonths + 1 + futureMonths, 0);

  if (!futureCategories.includes(category)) {
    return zeroedColumn;
  }

  return predictByPastAverages(zeroedColumn, pastMonths, futureMonths, currentMonthRatio);
}

function calculateFutures(
  currentDate: Date,
  pastMonths: number,
  futureMonths: number,
): (summary: Summary) => Summary {
  if (futureMonths <= 0) {
    return identity;
  }

  const currentMonthRatio = getDaysInMonth(currentDate) / getDate(currentDate);

  return (summary: Summary): Summary =>
    (Object.keys(summary) as (keyof Summary)[]).reduce(
      (last, category: keyof Summary) => ({
        ...last,
        [category]: predictCategory(
          summary[category] || [],
          category,
          pastMonths,
          futureMonths,
          currentMonthRatio,
        ),
      }),
      {
        netWorth: [],
        funds: [],
        fundCosts: [],
        fundsOld: [],
        fundCostsOld: [],
        income: [],
        bills: [],
        food: [],
        general: [],
        holiday: [],
        social: [],
      },
    );
}

const getNetCashFlow = (monthDates: Date[]) => (
  data: Summary & { spending: number[] },
): Summary & { spending: number[]; net: number[] } => ({
  ...data,
  net: monthDates.map((date, index) => data.income[index] - data.spending[index]),
});

const getPredictedNetWorth = (monthDates: Date[], currentDate: Date, netWorth: number[]) => (
  data: Summary & { spending: number[]; net: number[] },
): Summary & {
  spending: number[];
  net: number[];
  netWorthPredicted: number[];
} => {
  const endOfCurrentMonth = endOfMonth(currentDate);
  const futureStart = isSameDay(endOfCurrentMonth, currentDate)
    ? addMonths(endOfCurrentMonth, 1)
    : endOfCurrentMonth;

  return {
    ...data,
    netWorthPredicted: monthDates.reduce((values: number[], date, index) => {
      if (index === 0) {
        return [...values, netWorth[index]];
      }

      const future = monthDates[index] > futureStart;

      const fundProfits =
        data.funds[index] -
        data.funds[index - 1] -
        (data.fundCosts[index] - data.fundCosts[index - 1]);

      const netChange = data.net[index] + fundProfits;

      if (future) {
        return [...values, values[values.length - 1] + netChange];
      }

      return [...values, netWorth[index - 1] + netChange];
    }, []),
  };
};

const getCombinedNetWorth = (currentDate: Date, futureMonths: number, netWorth: number[]) => (
  table: Summary & { spending: number[]; net: number[]; netWorthPredicted: number[] },
): Summary & {
  spending: number[];
  net: number[];
  netWorthPredicted: number[];
  netWorthCombined: number[];
} => {
  const includeThisMonth = isSameDay(endOfMonth(currentDate), currentDate) ? 0 : 1;

  const slice = -(futureMonths + includeThisMonth);

  return {
    ...table,
    netWorthCombined: [...netWorth.slice(0, slice), ...table.netWorthPredicted.slice(slice)],
  };
};

const withNetWorth = (
  monthDates: Date[],
  currentDate: Date,
  futureMonths: number,
  netWorth: number[],
): ((
  data: Summary & { spending: number[]; net: number[] },
) => Summary & {
  spending: number[];
  net: number[];
  netWorthPredicted: number[];
  netWorthCombined: number[];
}) =>
  compose<
    Summary & { spending: number[]; net: number[] },
    Summary & { spending: number[]; net: number[]; netWorth: number[] },
    Summary & {
      spending: number[];
      net: number[];
      netWorth: number[];
      netWorthPredicted: number[];
    },
    Summary & {
      spending: number[];
      net: number[];
      netWorthPredicted: number[];
      netWorthCombined: number[];
    }
  >(
    getCombinedNetWorth(currentDate, futureMonths, netWorth),
    getPredictedNetWorth(monthDates, currentDate, netWorth),
    (
      data: Summary & { spending: number[]; net: number[] },
    ): Summary & { spending: number[]; net: number[]; netWorth: number[] } => ({
      ...data,
      netWorth,
    }),
  );

export const withSpending = (summary: Summary): Summary & { spending: number[] } => ({
  ...summary,
  spending: summary.bills.map((value, index) =>
    spendingCategories.reduce((sum, category) => sum + ((summary[category] || [])[index] || 0), 0),
  ),
});

export const getProcessedColumns: OutputSelector<
  State,
  ProcessedSummary,
  (
    currentDate: Date,
    numMonths: number,
    oldMonths: number,
    pastMonths: number,
    futureMonths: number,
    monthDates: Date[],
    netWorth: number[],
    summary: Summary,
  ) => ProcessedSummary
> = createSelector(
  getCurrentDate,
  getNumMonths,
  getOldMonths,
  getPastMonths,
  getFutureMonths,
  getMonthDates,
  getNetWorthSummary,
  getSummary,
  (currentDate, numMonths, oldMonths, pastMonths, futureMonths, monthDates, netWorth, summary) =>
    compose<
      Summary,
      Summary,
      Summary,
      Summary & {
        spending: number[];
      },
      Summary & {
        spending: number[];
        net: number[];
      },
      ProcessedSummary
    >(
      withNetWorth(monthDates, currentDate, futureMonths, netWorth),
      getNetCashFlow(monthDates),
      withSpending,
      calculateFutures(currentDate, pastMonths, futureMonths),
      separateOldFunds(oldMonths, pastMonths, futureMonths),
    )(summary),
);

const minColumnValue = (values: number[]): number => Math.min(...values);
const maxColumnValue = (values: number[]): number => Math.max(...values);

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

const minNegativeColumnValue = (values: number[]): number => Math.min(...values.filter(isNegative));
const maxPositiveColumnValue = (values: number[]): number => Math.max(...values.filter(isPositive));

const tableKeys: (keyof TableColumns)[] = OVERVIEW_COLUMNS.map(([key]) => key);

export const getOverviewTable: OutputSelector<
  State,
  Table,
  (
    currentDate: Date,
    dates: Date[],
    futureMonths: number,
    columns: ProcessedSummary,
    netWorth: number[],
  ) => Table
> = createSelector(
  getCurrentDate,
  getMonthDates,
  getFutureMonths,
  getProcessedColumns,
  getNetWorthSummary,
  (currentDate, dates, futureMonths, columns, netWorth) => {
    if (!dates) {
      return [];
    }

    const months = dates.map((date: Date) => format(date, 'LLL-yy'));

    const values: TableColumns = tableKeys.reduce(
      (last, key) => ({ [key]: columns[key], ...last }),
      {
        netWorth,
      },
    );

    const scoreValues: TableColumns = {
      ...values,
      netWorth: values.netWorth?.slice(0, -(futureMonths + 1)),
    };

    const categoryColor = getOverviewCategoryColor();

    const getColor = (value: number, key: keyof TableColumns): string =>
      getOverviewScoreColor(
        value,
        {
          min: minColumnValue(scoreValues[key] || []),
          max: maxColumnValue(scoreValues[key] || []),
          minNegative: minNegativeColumnValue(scoreValues[key] || []),
          maxPositive: maxPositiveColumnValue(scoreValues[key] || []),
        },
        {
          positive: average((scoreValues[key] || []).filter(isPositive), AVERAGE_MEDIAN),
          negative: average((scoreValues[key] || []).filter(isNegative), AVERAGE_MEDIAN),
        },
        categoryColor[key],
      );

    const getCells = (monthText: string, index: number): TableCell[] => [
      {
        column: ['month', 'Month'],
        value: monthText,
      },
      ...OVERVIEW_COLUMNS.map(([key, display]) => {
        const column: [string, string] = [key, display];
        const value = (columns[key] || [])[index];

        return {
          column,
          value,
          rgb: getColor(value, key),
        };
      }),
    ];

    const endOfCurrentMonth = endOfMonth(currentDate);

    return months.map((monthText: string, index: number) => {
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
