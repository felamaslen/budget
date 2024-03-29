import endOfMonth from 'date-fns/endOfMonth';
import isSameDay from 'date-fns/isSameDay';

import { GRAPH_SPEND_CATEGORIES } from '~client/constants/graph';
import type {
  LongTermOptions,
  OverviewGraphDate,
  OverviewGraphPartial,
  OverviewGraphRequired,
} from '~client/types';
import type { Monthly } from '~client/types/gql';
import type { GQL } from '~shared/types';

export const spendingCategories = GRAPH_SPEND_CATEGORIES.map(({ name }) => name);

export const roundedArrays = <T extends Record<string, unknown[]>>(items: T): T =>
  Object.entries(items).reduce<T>(
    (last, [key, values]) =>
      Array.isArray(values) ? { ...last, [key]: values.map(Math.round) } : last,
    items,
  );

export const roundedNumbers = <T extends Record<string, unknown>>(items: T): T =>
  Object.entries(items).reduce<T>(
    (last, [key, value]) =>
      typeof value === 'number' ? { ...last, [key]: Math.round(value) } : last,
    items,
  );

export const getSpendingColumn = (graph: GQL<Monthly>, numDates: number): number[] =>
  Array(numDates)
    .fill(0)
    .map<number>((_, index) =>
      spendingCategories.reduce<number>(
        (sum, category) => sum + (graph[category]?.[index] ?? 0),
        0,
      ),
    );

export const withSpendingColumn =
  <G extends OverviewGraphPartial>(numDates: number) =>
  (graph: G): OverviewGraphRequired<'spending', G> => ({
    ...graph,
    spending: getSpendingColumn(graph, numDates),
  });

export const currentDayIsEndOfMonth = (today: Date): boolean => isSameDay(endOfMonth(today), today);

export const longTermOptionsDisabled: LongTermOptions = { enabled: false, rates: {} };

export const mapMonthDates = (dates: Date[]): OverviewGraphDate[] =>
  dates.map<OverviewGraphDate>((date, monthIndex) => ({ date, monthIndex }));

export const reduceDates = <T>(
  dates: OverviewGraphDate[],
  reducerFn: (
    last: T[],
    nextDate: OverviewGraphDate,
    prevDate: OverviewGraphDate,
    index: number,
  ) => T[],
  initialDate: OverviewGraphDate,
  initialItems: T[] = [],
): T[] =>
  dates.reduce<{ items: T[]; prevDate: OverviewGraphDate }>(
    (last, nextDate, index) => ({
      items: reducerFn(last.items, nextDate, last.prevDate, index),
      prevDate: nextDate,
    }),
    { items: initialItems, prevDate: initialDate },
  ).items;
