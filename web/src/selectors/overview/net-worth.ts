import { createSelector } from 'reselect';
import { compose } from '@typed/compose';
import isSameMonth from 'date-fns/isSameMonth';
import differenceInYears from 'date-fns/differenceInYears';
import differenceInDays from 'date-fns/differenceInDays';
import startOfYear from 'date-fns/startOfYear';
import format from 'date-fns/format';

import { getCost, getSpendingColumn, getMonthDates } from '~client/selectors/overview/common';

import { sortByKey, withoutDeleted } from '~client/modules/data';
import { getRequests } from '~client/selectors/crud';
import { Create, CreateEdit, RequestType, WithCrud, Request } from '~client/types/crud';
import {
  Category,
  Subcategory,
  Entry,
  Value,
  ValueObject,
  Currency,
  CreditLimit,
  isComplex,
  isFX,
  RequestItem,
  Aggregate,
  AggregateSums,
} from '~client/types/net-worth';
import { Cost } from '~client/types/overview';
import { State } from '~client/reducers';

const nullEntry = (date: Date): Create<Entry> => ({
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

const FTI_START = new Date(process.env.BIRTH_DATE || '1990-01-01');

const getNonFilteredCategories = (state: State): WithCrud<Category>[] => state.netWorth.categories;
const getNonFilteredSubcategories = (state: State): WithCrud<Subcategory>[] =>
  state.netWorth.subcategories;
const getNonFilteredEntries = (state: State): WithCrud<Entry>[] => state.netWorth.entries;

export const getEntries = createSelector(getNonFilteredEntries, withoutDeleted);
export const getCategories = createSelector(
  getNonFilteredCategories,
  compose(withoutDeleted, sortByKey<'type' | 'category', WithCrud<Category>>('type', 'category')),
);
export const getSubcategories = createSelector(
  getNonFilteredSubcategories,
  compose(
    withoutDeleted,
    sortByKey<'subcategory', WithCrud<Subcategory>>('subcategory'),
    sortByKey<'categoryId', WithCrud<Subcategory>>('categoryId'),
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

    return last + part;
  }, 0);
}

const sumValues = (currencies: Currency[], values: ValueObject[]): number =>
  values.reduce((last: number, { value }): number => last + getComplexValue(value, currencies), 0);

function getSumByCategory(
  categories: Category[],
  subcategories: Subcategory[],
  entries: CreateEdit<Entry>[],
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
  Category[],
  Subcategory[],
  Entry[],
  AggregateSums
>(getCategories, getSubcategories, getEntries, (categories, subcategories, entries) =>
  Object.entries(Aggregate).reduce(
    (last: AggregateSums, [key, categoryName]) => ({
      ...last,
      [key]: getSumByCategory(categories, subcategories, entries, categoryName),
    }),
    {} as AggregateSums,
  ),
);

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
  sumValues(currencies, values);

export const getNetWorthSummary = createSelector<State, CreateEdit<Entry>[], number[]>(
  getNetWorthRows,
  (rows: CreateEdit<Entry>[]): number[] => rows.map(getValues),
);

export const getNetWorthSummaryOld = (state: State): number[] => state.netWorth.old;

const sumByType = (
  categoryType: string,
  categories: Category[],
  subcategories: Subcategory[],
  { currencies, values }: CreateEdit<Entry>,
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

type EntryTypeSplit = Entry & {
  assets: number;
  liabilities: number;
};

const withTypeSplit = (categories: Category[], subcategories: Subcategory[]) => (
  rows: Entry[],
): EntryTypeSplit[] =>
  rows.map(entry => ({
    ...entry,
    assets: sumByType('asset', categories, subcategories, entry),
    liabilities: -sumByType('liability', categories, subcategories, entry),
  }));

function getSpendingByDate(spending: number[], dates: Date[], date: Date): number {
  const dateIndex = dates.findIndex(compare => isSameMonth(compare, date));
  if (dateIndex === -1) {
    return 0;
  }

  return spending[dateIndex];
}

type EntryWithSpend = EntryTypeSplit & { expenses: number };

const withSpend = (dates: Date[], spending: number[]) => (
  rows: EntryTypeSplit[],
): EntryWithSpend[] =>
  rows.map(entry => ({
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

type EntryWithTableProps = Omit<EntryWithFTI, 'values' | 'creditLimit' | 'currencies'>;

const withTableProps = (rows: EntryWithFTI[]): EntryWithTableProps[] =>
  rows.map(({ id, date, assets, liabilities, expenses, fti, pastYearAverageSpend }) => ({
    id,
    date,
    assets,
    liabilities,
    expenses,
    fti,
    pastYearAverageSpend,
  }));

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
    )(entries),
);

const withCategoryRequests = (categories: WithCrud<Category>[]) => (
  requests: Request[],
): Request[] => requests.concat(getRequests('data/net-worth/categories')(categories));

const subcategoryPending = (categories: WithCrud<Category>[]) => (categoryId: string): boolean =>
  categories.some(
    ({ id, __optimistic }) => id === categoryId && __optimistic === RequestType.create,
  );

const withSubcategoryRequests = (
  categories: WithCrud<Category>[],
  subcategories: WithCrud<Subcategory>[],
) => (requests: Request[]): Request[] =>
  requests.concat(
    getRequests('data/net-worth/subcategories')(
      subcategories.filter(
        ({ categoryId }: Subcategory) => !subcategoryPending(categories)(categoryId),
      ),
    ),
  );

const groupPending = (
  categories: WithCrud<Category>[],
  subcategories: WithCrud<Subcategory>[],
) => ({ subcategory }: ValueObject | CreditLimit): boolean =>
  subcategories.some(
    ({ id, categoryId, __optimistic }) =>
      id === subcategory &&
      (__optimistic === RequestType.create || subcategoryPending(categories)(categoryId)),
  );

const withoutIds = <T extends { id?: string }>(items: T[]): Omit<T, 'id'>[] =>
  items.map(({ id, ...rest }) => rest);

const withEntryRequests = (
  categories: Category[],
  subcategories: Subcategory[],
  entries: WithCrud<Entry>[],
) => (requests: Request[]): Request[] =>
  requests.concat(
    getRequests<RequestItem>('data/net-worth')(
      entries
        .filter(({ values, creditLimit }: WithCrud<Entry>) =>
          [values, creditLimit].every(
            group => !group.some(groupPending(categories, subcategories)),
          ),
        )
        .map(({ date, values, creditLimit, currencies, ...rest }: WithCrud<Entry>) => ({
          date: format(date, 'yyyy-MM-dd'),
          values: withoutIds(values),
          creditLimit: withoutIds(creditLimit),
          currencies: withoutIds(currencies),
          ...rest,
        })),
    ),
  );

export const getNetWorthRequests = createSelector(
  [getNonFilteredCategories, getNonFilteredSubcategories, getNonFilteredEntries],
  (categories, subcategories, entries) =>
    compose(
      withCategoryRequests(categories),
      withSubcategoryRequests(categories, subcategories),
      withEntryRequests(categories, subcategories, entries),
    )([]),
);
