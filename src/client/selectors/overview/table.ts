import endOfMonth from 'date-fns/endOfMonth';
import formatDate from 'date-fns/format';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getFutureMonths, getMonthDates } from './common';
import { getOverviewGraphValues } from './graph';

import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import type { State } from '~client/reducers/types';
import type {
  Median,
  OverviewGraphValues,
  OverviewTable,
  OverviewTableRow,
  SplitRange,
  TableValues,
} from '~client/types';
import { InitialCumulativeValues } from '~client/types/gql';
import { arrayAverage, Average } from '~shared/utils';

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

const getFormattedMonths = (
  dates: Date[],
): Pick<OverviewTableRow, 'year' | 'month' | 'monthText'>[] =>
  dates.map((date) => ({
    year: getYear(date),
    month: getMonth(date) + 1,
    monthText: formatDate(date, 'LLL-yy'),
  }));

type TableNumberRows = TableValues<number[], 'netWorth' | 'net'>;

const getTableValues = (monthly: OverviewGraphValues): TableNumberRows =>
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

const getCellColor =
  (ranges: Ranges, medians: Medians) =>
  (value: number, key: keyof TableValues): string =>
    getOverviewScoreColor(value, ranges[key], medians[key], overviewCategoryColor[key]);

const getCells =
  (graph: OverviewGraphValues, getColor: ReturnType<typeof getCellColor>) =>
  (index: number): OverviewTableRow['cells'] =>
    OVERVIEW_COLUMNS.reduce<OverviewTableRow['cells']>(
      (
        last,
        [
          key,
          {
            include = [key as keyof Omit<OverviewGraphValues, 'startPredictionIndex'>],
            exclude = [],
          },
        ],
      ) => {
        const value =
          include.reduce<number>((sum, column) => sum + graph[column][index], 0) -
          exclude.reduce<number>((sum, column) => sum + graph[column][index], 0);

        return { ...last, [key]: { value, rgb: getColor(value, key as keyof TableValues) } };
      },
      {} as OverviewTableRow['cells'],
    );

export const getOverviewTable = moize(
  (today: Date): ((state: State) => OverviewTable) =>
    createSelector(
      getMonthDates,
      getFutureMonths(today),
      getOverviewGraphValues(today, 0),
      (dates, futureMonths, graph): OverviewTable => {
        const months = getFormattedMonths(dates);
        const values = getTableValues(graph.values);
        const scoreValues = getScoreValues(values, futureMonths);
        const ranges = getRanges(values, scoreValues);
        const medians = getMedians(values, scoreValues);
        const endOfCurrentMonth = endOfMonth(today);

        const getRowCells = getCells(graph.values, getCellColor(ranges, medians));

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

export const getInitialCumulativeValues = (state: State): InitialCumulativeValues =>
  state.overview.initialCumulativeValues;
