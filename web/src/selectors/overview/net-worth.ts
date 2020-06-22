import { compose } from '@typed/compose';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInYears from 'date-fns/differenceInYears';
import format from 'date-fns/format';
import isSameMonth from 'date-fns/isSameMonth';
import startOfYear from 'date-fns/startOfYear';
import { createSelector } from 'reselect';

import { sortByKey, withoutIds } from '~client/modules/data';

import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';

import { getRequests, withoutDeleted } from '~client/selectors/crud';
import { getCost, getSpendingColumn, getMonthDates } from '~client/selectors/overview/common';

import {
  Create,
  CreateEdit,
  RequestType,
  Request,
  Category,
  Subcategory,
  Entry,
  CreateEntry,
  RawDate,
  Value,
  ValueObject,
  Currency,
  CreditLimit,
  isComplex,
  isFX,
  SyncPayloadNetWorth,
  Aggregate,
  AggregateSums,
  isOption,
  OptionValue,
  NetWorthTableRow as TableRow,
  Cost,
} from '~client/types';

const nullEntry = (date: Date): Create<Entry> => ({
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

const FTI_START = new Date(process.env.BIRTH_DATE || '1990-01-01');

const getNonFilteredCategories = (state: State): CrudState<Category> => state.netWorth.categories;
const getNonFilteredSubcategories = (state: State): CrudState<Subcategory> =>
  state.netWorth.subcategories;
const getNonFilteredEntries = (state: State): CrudState<Entry> => state.netWorth.entries;

export const getEntries = createSelector(getNonFilteredEntries, withoutDeleted);
export const getCategories = createSelector(
  getNonFilteredCategories,
  compose<CrudState<Category>, Category[], Category[]>(
    sortByKey('type', 'category'),
    withoutDeleted,
  ),
);
export const getSubcategories = createSelector(
  getNonFilteredSubcategories,
  compose<CrudState<Subcategory>, Subcategory[], Subcategory[], Subcategory[]>(
    sortByKey('subcategory'),
    sortByKey('categoryId'),
    withoutDeleted,
  ),
);

const withoutSkipValues = (entries: Entry[]): Entry[] =>
  entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ skip }) => !skip),
  }));

const getSummaryEntries = createSelector(getEntries, withoutSkipValues);

function getComplexValue(value: Value, currencies: Currency[]): number {
  if (!isComplex(value)) {
    return value;
  }

  return value.reduce((last: number, part) => {
    if (isFX(part)) {
      const { value: numberValue, currency } = part;

      const currencyMatch = currencies.find(({ currency: name }) => name === currency);
      if (!currencyMatch) {
        return last;
      }

      // converting from currency to GBX, but rate is against GBP
      return last + currencyMatch.rate * numberValue * 100;
    }
    if (isOption(part)) {
      return last + part.units * part.marketPrice;
    }

    return last + part;
  }, 0);
}

const sumValues = (currencies: Currency[], values: ValueObject[]): number =>
  values.reduce((last: number, { value }): number => last + getComplexValue(value, currencies), 0);

function getSumByCategory(
  categoryName: string,
  categories: Category[],
  subcategories: Subcategory[],
  { values, currencies }: CreateEdit<Entry>,
): number {
  if (!(categories.length && subcategories.length)) {
    return 0;
  }

  const category = categories.find(({ category: name }) => name === categoryName);
  if (!category) {
    return 0;
  }

  const valuesFiltered = values.filter(({ subcategory }) =>
    subcategories.some(({ id, categoryId }) => id === subcategory && categoryId === category.id),
  );

  return sumValues(currencies, valuesFiltered);
}

const getEntryAggregate = (
  categories: Category[],
  subcategories: Subcategory[],
  entry: CreateEdit<Entry>,
): AggregateSums =>
  Object.entries(Aggregate).reduce(
    (last: AggregateSums, [, categoryName]) => ({
      ...last,
      [categoryName]: getSumByCategory(categoryName, categories, subcategories, entry),
    }),
    {} as AggregateSums,
  );

type EntryWithAggregates = Entry & {
  aggregate: AggregateSums;
};

const withAggregates = (categories: Category[], subcategories: Subcategory[]) => (
  rows: Entry[],
): EntryWithAggregates[] =>
  rows.map((entry) => ({
    ...entry,
    aggregate: getEntryAggregate(categories, subcategories, entry),
  }));

const getEntryForMonth = (entries: CreateEdit<Entry>[]) => (date: Date): CreateEdit<Entry> => {
  const matchingEntries = entries
    .filter(({ date: entryDate }) => isSameMonth(entryDate, date))
    .sort(({ date: dateA }, { date: dateB }) => Number(dateB) - Number(dateA));

  if (!matchingEntries.length) {
    return nullEntry(date);
  }

  return matchingEntries[matchingEntries.length - 1];
};

const getNetWorthRows = createSelector(getMonthDates, getSummaryEntries, (monthDates, entries) =>
  monthDates.map(getEntryForMonth(entries)),
);

const getValues = ({ currencies, values }: CreateEdit<Entry>): number =>
  sumValues(
    currencies,
    values.filter(({ value }) => !(isComplex(value) && value.some(isOption))),
  );

export const getNetWorthSummary = createSelector<State, CreateEdit<Entry>[], number[]>(
  getNetWorthRows,
  (rows: CreateEdit<Entry>[]): number[] => rows.map(getValues),
);

export type NetWorthSummaryOld = {
  main: number[];
  options: number[];
};

export const getNetWorthSummaryOld = (state: State): NetWorthSummaryOld => ({
  main: state.netWorth.old,
  options: state.netWorth.oldOptions,
});

const sumByType = (
  categoryType: string,
  categories: Category[],
  subcategories: Subcategory[],
  { currencies, values }: CreateEdit<Entry>,
  categoryPredicate: (category: Category) => boolean = (): true => true,
): number =>
  sumValues(
    currencies,
    values.filter(({ subcategory }) =>
      subcategories.some(
        ({ id, categoryId }) =>
          id === subcategory &&
          categories
            .filter(categoryPredicate)
            .some(({ id: compare, type }) => compare === categoryId && type === categoryType),
      ),
    ),
  );

type EntryTypeSplit = EntryWithAggregates & {
  assets: number;
  options: number;
  liabilities: number;
};

const withTypeSplit = (categories: Category[], subcategories: Subcategory[]) => (
  rows: EntryWithAggregates[],
): EntryTypeSplit[] =>
  rows.map((entry) => ({
    ...entry,
    assets: sumByType('asset', categories, subcategories, entry, (category) => !category.isOption),
    options: sumByType('asset', categories, subcategories, entry, (category) => category.isOption),
    liabilities: -sumByType('liability', categories, subcategories, entry),
  }));

function getSpendingByDate(spending: number[], dates: Date[], date: Date): number {
  const dateIndex = dates.findIndex((compare) => isSameMonth(compare, date));
  if (dateIndex === -1) {
    return 0;
  }

  return spending[dateIndex];
}

type EntryWithSpend = EntryTypeSplit & { expenses: number };

const withSpend = (dates: Date[], spending: number[]) => (
  rows: EntryTypeSplit[],
): EntryWithSpend[] =>
  rows.map((entry) => ({
    ...entry,
    expenses: getSpendingByDate(spending, dates, entry.date),
  }));

type EntryWithFTI = EntryWithSpend & { fti: number; pastYearAverageSpend: number };

const withFTI = (rows: EntryWithSpend[]): EntryWithFTI[] =>
  rows.map((entry, index) => {
    const fullYears = differenceInYears(entry.date, FTI_START);
    const days = differenceInDays(entry.date, startOfYear(entry.date));
    const years = fullYears + days / 365;

    const pastYear = rows.slice(Math.max(0, index - 11), index + 1);
    const pastYearSpend = pastYear.reduce((sum, { expenses }) => sum + expenses, 0);
    const pastYearAverageSpend = (pastYearSpend * 12) / pastYear.length;

    const fti = (entry.assets - entry.liabilities) * (years / pastYearAverageSpend);

    return { ...entry, fti, pastYearAverageSpend };
  });

type EntryWithTableProps = TableRow;

const withTableProps = (rows: EntryWithFTI[]): EntryWithTableProps[] =>
  rows.map(({ values, creditLimit, currencies, ...rest }) => rest);

export const getNetWorthTable = createSelector(
  getCost,
  getMonthDates,
  getCategories,
  getSubcategories,
  getSummaryEntries,
  (
    costMap: Cost,
    dates: Date[],
    categories: Category[],
    subcategories: Subcategory[],
    entries: Entry[],
  ) =>
    compose(
      withTableProps,
      withFTI,
      withSpend(dates, getSpendingColumn(dates)(costMap).spending),
      withTypeSplit(categories, subcategories),
      withAggregates(categories, subcategories),
    )(entries),
);

const withCategoryRequests = (categories: CrudState<Category>) => (
  requests: Request[],
): Request[] => [...requests, ...getRequests('data/net-worth/categories')(categories)];

const withSubcategoryRequests = (
  categories: CrudState<Category>,
  subcategories: CrudState<Subcategory>,
) => (requests: Request[]): Request[] => [
  ...requests,
  ...getRequests('data/net-worth/subcategories')(
    categories.items
      .filter((_, index) => categories.__optimistic[index] === RequestType.create)
      .reduce<CrudState<Subcategory>>((last, category) => {
        const pendingIndexes = last.items.reduce<number[]>(
          (lastIndexes, { categoryId }, index) =>
            categoryId === category.id ? [...lastIndexes, index] : lastIndexes,
          [],
        );

        return {
          items: last.items.filter((_, index) => !pendingIndexes.includes(index)),
          __optimistic: last.__optimistic.filter((_, index) => !pendingIndexes.includes(index)),
        };
      }, subcategories),
  ),
];

const baseOption: OptionValue = {
  units: 0,
  strikePrice: 0,
  marketPrice: 0,
};

const groupPending = (categories: CrudState<Category>, subcategories: CrudState<Subcategory>) => ({
  subcategory,
}: ValueObject | CreditLimit): boolean =>
  subcategories.items.some(
    ({ id, categoryId }, index) =>
      id === subcategory &&
      (subcategories.__optimistic[index] === RequestType.create ||
        categories.items.some(
          (category, categoryIndex) =>
            category.id === categoryId &&
            categories.__optimistic[categoryIndex] === RequestType.create,
        )),
  );

const withSingleOptionValues = (categories: Category[], subcategories: Subcategory[]) => (
  values: Omit<ValueObject, 'id'>[],
): Omit<ValueObject, 'id'>[] =>
  values.map((valueObject: Omit<ValueObject, 'id'>) => {
    const categoryId = subcategories.find(({ id }) => id === valueObject.subcategory)?.categoryId;
    if (categories.find(({ id }) => id === categoryId)?.isOption) {
      return {
        ...valueObject,
        value: isComplex(valueObject.value)
          ? [valueObject.value.find(isOption) ?? baseOption]
          : [baseOption],
      };
    }

    return valueObject;
  });

const withEntryRequests = (
  categories: CrudState<Category>,
  subcategories: CrudState<Subcategory>,
  entries: CrudState<Entry>,
) => (requests: Request[]): Request[] => [
  ...requests,
  ...getRequests<SyncPayloadNetWorth>('data/net-worth')(
    entries.items
      .map<Entry & { __optimistic: RequestType | undefined }>((entry, index) => ({
        ...entry,
        __optimistic: entries.__optimistic[index],
      }))
      .filter(({ values, creditLimit }) =>
        [values, creditLimit].every(
          (group) => !group.some(groupPending(categories, subcategories)),
        ),
      )
      .reduce<CrudState<RawDate<CreateEntry>>>(
        (last, { __optimistic, ...entry }) => ({
          items: [
            ...last.items,
            {
              id: entry.id,
              date: format(entry.date, 'yyyy-MM-dd'),
              values: compose<ValueObject[], Create<ValueObject>[], Create<ValueObject>[]>(
                withSingleOptionValues(categories.items, subcategories.items),
                withoutIds,
              )(entry.values),
              creditLimit: entry.creditLimit,
              currencies: withoutIds(entry.currencies),
            },
          ],
          __optimistic: [...last.__optimistic, __optimistic],
        }),
        {
          items: [],
          __optimistic: [],
        },
      ),
  ),
];

export const getNetWorthRequests = createSelector(
  getNonFilteredCategories,
  getNonFilteredSubcategories,
  getNonFilteredEntries,
  (categories, subcategories, entries) =>
    compose(
      withCategoryRequests(categories),
      withSubcategoryRequests(categories, subcategories),
      withEntryRequests(categories, subcategories, entries),
    )([]),
);
