import { createSelector } from 'reselect';
import { compose } from '@typed/compose';
import isSameMonth from 'date-fns/isSameMonth';
import setYear from 'date-fns/setYear';
import getYear from 'date-fns/getYear';
import differenceInYears from 'date-fns/differenceInYears';
import differenceInMonths from 'date-fns/differenceInMonths';

import { ExcludeOne } from '~/types/utils';
import { MonthCost } from '~/types/overview';
import {
  Entry,
  EntryValue,
  OptimisticCategory,
  OptimisticSubcategory,
  OptimisticEntry,
  Value,
  isSimpleValue,
  isComplexValue,
  Currency,
  CategoryType,
} from '~/types/net-worth';

import { NET_WORTH_AGGREGATE } from '~/constants/net-worth';

import {
  State,
  spendingCategories,
  getOverviewNetWorth,
  getMonthCost,
  getOldMonths,
  getMonthDates,
} from '~/selectors/overview/common';

import { sortByKey } from '~/modules/array';
import { withoutDeleted } from '~/modules/crud';

const nullEntry = (date: Date): ExcludeOne<Entry, 'id'> => ({
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

const FTI_START: Date = new Date(process.env.BIRTH_DATE || '1990-01-01');

type TableEntry = {
  id: string;
  date: Date;
  assets: number;
  liabilities: number;
  expenses: number;
  fti: number;
};

const getNonFilteredCategories = (state: State): OptimisticCategory[] =>
  state.netWorth.categories.items;
const getNonFilteredSubcategories = (state: State): OptimisticSubcategory[] =>
  state.netWorth.subcategories.items;
const getNonFilteredEntries = (state: State): OptimisticEntry[] => state.netWorth.entries.items;

export const getEntries = createSelector<State, OptimisticEntry[], OptimisticEntry[]>(
  getNonFilteredEntries,
  withoutDeleted,
);
export const getCategories = createSelector<State, OptimisticCategory[], OptimisticCategory[]>(
  getNonFilteredCategories,
  compose<OptimisticCategory[], OptimisticCategory[], OptimisticCategory[]>(
    sortByKey<OptimisticCategory>('type', 'category'),
    withoutDeleted,
  ),
);
export const getSubcategories = createSelector<
  State,
  OptimisticSubcategory[],
  OptimisticSubcategory[]
>(
  getNonFilteredSubcategories,
  compose<
    OptimisticSubcategory[],
    OptimisticSubcategory[],
    OptimisticSubcategory[],
    OptimisticSubcategory[]
  >(
    sortByKey<OptimisticSubcategory>('categoryId'),
    sortByKey<OptimisticSubcategory>('subcategory'),
    withoutDeleted,
  ),
);

const withoutSkipValues = (entries: OptimisticEntry[]): OptimisticEntry[] =>
  entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ skip }) => !skip),
  }));

const getSummaryEntries = createSelector<State, OptimisticEntry[], OptimisticEntry[]>(
  getEntries,
  withoutSkipValues,
);

function getComplexValue(value: EntryValue, currencies: Currency[]): number {
  if (isSimpleValue(value)) {
    return value;
  }
  if (!isComplexValue(value)) {
    return 0;
  }

  return value.reduce(
    (last: number, part: number | { value: number; currency?: string | null }) => {
      if (isSimpleValue(part)) {
        return last + part;
      }

      const { value: numberValue, currency } = part;

      const currencyMatch = currencies.find(({ currency: name }) => name === currency);
      if (!currencyMatch) {
        return last;
      }

      // converting from currency to GBX, but rate is against GBP
      return last + currencyMatch.rate * numberValue * 100;
    },
    0,
  );
}

const sumValues = (currencies: Currency[], values: Value[]): number =>
  values.reduce((last: number, { value }) => last + getComplexValue(value, currencies), 0);

function getSumByCategory(
  categories: OptimisticCategory[],
  subcategories: OptimisticSubcategory[],
  entries: OptimisticEntry[],
  categoryName: string,
): number {
  if (!(entries.length && categories.length && subcategories.length)) {
    return 0;
  }

  const category = categories.find(({ category: name }) => name === categoryName);
  if (!category) {
    return 0;
  }

  const { currencies, values } = entries[entries.length - 1];

  const valuesFiltered = values.filter(({ subcategory }) =>
    subcategories.some(({ id, categoryId }) => id === subcategory && categoryId === category.id),
  );

  return sumValues(currencies, valuesFiltered);
}

export const getAggregates = createSelector<
  State,
  OptimisticCategory[],
  OptimisticSubcategory[],
  OptimisticEntry[],
  { [key: string]: number }
>(
  getCategories,
  getSubcategories,
  getEntries,
  (
    categories: OptimisticCategory[],
    subcategories: OptimisticSubcategory[],
    entries: OptimisticEntry[],
  ) =>
    Object.keys(NET_WORTH_AGGREGATE).reduce(
      (last, key) => ({
        ...last,
        [key]: getSumByCategory(categories, subcategories, entries, NET_WORTH_AGGREGATE[key]),
      }),
      {},
    ),
);

const getEntryForMonth = (
  entries: OptimisticEntry[],
): ((date: Date) => ExcludeOne<Entry, 'id'>) => (date: Date): ExcludeOne<Entry, 'id'> => {
  const matchingEntries = sortByKey<OptimisticEntry>('date')(
    entries.filter(({ date: entryDate }) => isSameMonth(entryDate, date)),
  );

  if (!matchingEntries.length) {
    return nullEntry(date);
  }

  return matchingEntries[matchingEntries.length - 1];
};

const getNetWorthRows = createSelector<State, Date[], OptimisticEntry[], ExcludeOne<Entry, 'id'>[]>(
  getMonthDates,
  getSummaryEntries,
  (monthDates, entries) => monthDates.map(getEntryForMonth(entries)),
);

const getValues = ({ currencies, values }: ExcludeOne<Entry, 'id'>): number =>
  sumValues(currencies, values);

export const getNetWorthSummary = createSelector<
  State,
  ExcludeOne<Entry, 'id'>[],
  OptimisticEntry[],
  number[],
  number,
  number[]
>(
  getNetWorthRows,
  getSummaryEntries,
  getOverviewNetWorth,
  getOldMonths,
  (rows, entries, overviewNetWorth, oldMonths): number[] => {
    if (!entries.length) {
      return overviewNetWorth.slice(oldMonths);
    }

    return rows.map(getValues);
  },
);

export const getNetWorthSummaryOld = createSelector<State, number[], number, number[]>(
  getOverviewNetWorth,
  getOldMonths,
  (overviewNetWorth, oldMonths): number[] => overviewNetWorth.slice(0, oldMonths),
);

const sumByType = (
  categoryType: CategoryType,
  categories: OptimisticCategory[],
  subcategories: OptimisticSubcategory[],
  { currencies, values }: OptimisticEntry,
): number =>
  sumValues(
    currencies,
    values.filter(({ subcategory }) =>
      subcategories.some(
        ({ id, categoryId }) =>
          id === subcategory &&
          categories.some(
            ({ id: compare, type }) => compare === categoryId && type === categoryType,
          ),
      ),
    ),
  );

const withTypeSplit = (
  categories: OptimisticCategory[],
  subcategories: OptimisticSubcategory[],
): ((rows: OptimisticEntry[]) => (OptimisticEntry & { assets: number; liabilities: number })[]) => (
  rows: OptimisticEntry[],
): (OptimisticEntry & { assets: number; liabilities: number })[] =>
  rows.map(entry => ({
    ...entry,
    assets: sumByType('asset', categories, subcategories, entry),
    liabilities: -sumByType('liability', categories, subcategories, entry),
  }));

function getSpendingByDate(expenses: number[], dates: Date[], date: Date): number {
  const dateIndex = dates.findIndex(compare => isSameMonth(compare, date));
  if (dateIndex === -1) {
    return 0;
  }

  return expenses[dateIndex];
}

const withSpend = (
  dates: Date[],
  expenses: number[],
): ((
  rows: (OptimisticEntry & { assets: number; liabilities: number })[],
) => (OptimisticEntry & {
  assets: number;
  liabilities: number;
  expenses: number;
})[]) => (
  rows: (OptimisticEntry & { assets: number; liabilities: number })[],
): (OptimisticEntry & { assets: number; liabilities: number; expenses: number })[] => {
  return rows.map(entry => ({
    ...entry,
    expenses: getSpendingByDate(expenses, dates, entry.date),
  }));
};

const withFTI = (
  rows: (OptimisticEntry & { assets: number; liabilities: number; expenses: number })[],
): (OptimisticEntry & {
  assets: number;
  liabilities: number;
  expenses: number;
  fti: number;
})[] =>
  rows.map((entry, index) => {
    const years =
      differenceInYears(entry.date, FTI_START) +
      differenceInMonths(entry.date, setYear(FTI_START, getYear(entry.date))) / 12;

    const pastYear = rows.slice(Math.max(0, index - 11), index + 1);
    const pastYearSpend = pastYear.reduce((sum, { expenses }) => sum + expenses, 0);
    const pastYearAverageSpend = (pastYearSpend * 12) / pastYear.length;

    const fti = (Number(entry.assets) - Number(entry.liabilities)) * (years / pastYearAverageSpend);

    return { ...entry, fti };
  });

const withTableProps = (
  rows: (OptimisticEntry & {
    expenses: number;
    assets: number;
    liabilities: number;
    fti: number;
  })[],
): TableEntry[] =>
  rows.map(({ id, date, assets, liabilities, expenses, fti }) => ({
    id,
    date,
    assets,
    liabilities,
    expenses,
    fti,
  }));

export const getSpendingColumn = createSelector<State, MonthCost, Date[], number[]>(
  getMonthCost,
  getMonthDates,
  (monthCost, monthDates) =>
    monthDates.map((date, index) =>
      spendingCategories.reduce(
        (sum, category: keyof MonthCost) => sum + (monthCost[category][index] || 0),
        0,
      ),
    ),
);

export const getNetWorthTable = createSelector<
  State,
  MonthCost,
  number[],
  Date[],
  OptimisticCategory[],
  OptimisticSubcategory[],
  OptimisticEntry[],
  TableEntry[]
>(
  getMonthCost,
  getSpendingColumn,
  getMonthDates,
  getCategories,
  getSubcategories,
  getSummaryEntries,
  (monthCost, spendingColumn, dates, categories, subcategories, entries): TableEntry[] =>
    compose<
      OptimisticEntry[],
      (OptimisticEntry & { assets: number; liabilities: number })[],
      (OptimisticEntry & { assets: number; liabilities: number; expenses: number })[],
      (OptimisticEntry & { assets: number; liabilities: number; expenses: number; fti: number })[],
      TableEntry[]
    >(
      withTableProps,
      withFTI,
      withSpend(dates, spendingColumn),
      withTypeSplit(categories, subcategories),
    )(entries),
);
