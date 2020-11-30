import { compose } from '@typed/compose';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInYears from 'date-fns/differenceInYears';
import format from 'date-fns/format';
import isSameMonth from 'date-fns/isSameMonth';
import startOfYear from 'date-fns/startOfYear';
import moize from 'moize';
import { createSelector } from 'reselect';

import {
  getCost,
  getSpendingColumn,
  getMonthDates,
  getFutureMonths,
  currentDayIsEndOfMonth,
} from './common';

import { sortByKey, withoutIds } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { getAppConfig } from '~client/selectors/config';
import { getRequests, withoutDeleted } from '~client/selectors/crud';
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
  isMortgageValue,
  MortgageValue,
  AppConfig,
} from '~client/types';

const nullEntry = (date: Date): Create<Entry> => ({
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

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

const isSAYE = (subcategories: Subcategory[], subcategory: number): boolean =>
  subcategories.find((compare) => compare.id === subcategory)?.isSAYE ?? false;

const optionValue = (value: OptionValue): number =>
  value.vested * Math.max(0, value.marketPrice - value.strikePrice);
const optionSAYEResidual = (value: OptionValue): number => value.vested * value.strikePrice;

function getComplexValue({ value }: ValueObject, currencies: Currency[]): number {
  if (isMortgageValue(value)) {
    return -value.principal;
  }
  if (!isComplex(value)) {
    return value;
  }

  return value.reduce<number>((last, part) => {
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
      return last + Math.round(optionValue(part));
    }

    return last + part;
  }, 0);
}

const sumValues = (currencies: Currency[], values: ValueObject[]): number =>
  values.reduce<number>(
    (last, valueObject): number => last + getComplexValue(valueObject, currencies),
    0,
  );

function calculateResidualSAYEOptionsValue(
  subcategories: Subcategory[],
  entry: Pick<CreateEdit<Entry>, 'values'>,
): number {
  return Math.round(
    entry.values
      .filter(({ subcategory }) => isSAYE(subcategories, subcategory))
      .reduce<number>((last, { value }) => {
        if (!isComplex(value)) {
          return last;
        }
        return value
          .filter(isOption)
          .reduce<number>((sum, part) => sum + optionSAYEResidual(part), last);
      }, 0),
  );
}

function getSumByCategory(
  categoryName: Aggregate,
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

function getResidual(
  categoryName: Aggregate,
  subcategories: Subcategory[],
  entry: CreateEdit<Entry>,
): number {
  if (categoryName === Aggregate.cashOther) {
    return calculateResidualSAYEOptionsValue(subcategories, entry);
  }
  return 0;
}

const getEntryAggregate = (
  categories: Category[],
  subcategories: Subcategory[],
  entry: CreateEdit<Entry>,
): AggregateSums =>
  Object.entries(Aggregate).reduce<AggregateSums>(
    (last, [, categoryName]) => ({
      ...last,
      [categoryName]:
        getSumByCategory(categoryName, categories, subcategories, entry) +
        getResidual(categoryName, subcategories, entry),
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

const getValues = (subcategories: Subcategory[]) => ({
  currencies,
  values,
}: CreateEdit<Entry>): number =>
  sumValues(
    currencies,
    values.filter(({ value }) => !(isComplex(value) && value.some(isOption))),
  ) + calculateResidualSAYEOptionsValue(subcategories, { values });

export const getNetWorthSummary = createSelector(
  getSubcategories,
  getNetWorthRows,
  (subcategories, rows): number[] => rows.map(getValues(subcategories)),
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
    assets:
      sumByType('asset', categories, subcategories, entry, (category) => !category.isOption) +
      calculateResidualSAYEOptionsValue(subcategories, entry),
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

const withFTI = (appConfig: Pick<AppConfig, 'birthDate'>) => (
  rows: EntryWithSpend[],
): EntryWithFTI[] =>
  rows.map((entry, index) => {
    const fullYears = differenceInYears(entry.date, appConfig.birthDate);
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
  getAppConfig,
  getCost,
  getMonthDates,
  getCategories,
  getSubcategories,
  getSummaryEntries,
  (
    appConfig,
    costMap: Cost,
    dates: Date[],
    categories: Category[],
    subcategories: Subcategory[],
    entries: Entry[],
  ) =>
    compose(
      withTableProps,
      withFTI(appConfig),
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
  vested: 0,
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

export const getLatestNetWorthAggregate = createSelector(
  getNetWorthTable,
  (netWorth) => netWorth[netWorth.length - 1]?.aggregate,
);

export const assumedHousePriceInflation = 0.05;

const houseCategory = 'House';

function PMT({ principal, paymentsRemaining, rate }: MortgageValue): number {
  if (!paymentsRemaining) {
    return 0;
  }
  if (!rate) {
    return principal / paymentsRemaining;
  }
  return ((rate / 1200) * principal) / (1 - (1 + rate / 1200) ** -paymentsRemaining);
}

export const getHomeEquity = moize(
  (today: Date) =>
    createSelector(
      getFutureMonths(today),
      getCategories,
      getSubcategories,
      getNetWorthRows,
      (futureMonths, categories, subcategories, rows) => {
        const startPredictionIndex = currentDayIsEndOfMonth(today)
          ? rows.length - futureMonths
          : rows.length - 1 - futureMonths;

        if (rows.length < startPredictionIndex) {
          return [];
        }

        const debtToPresent = rows
          .slice(0, startPredictionIndex)
          .map<number>((row) =>
            row.values.reduce<number>(
              (last, { value }) => last + (isMortgageValue(value) ? value.principal : 0),
              0,
            ),
          );

        const homeValueToPresent = rows.slice(0, startPredictionIndex).map<number>((row) =>
          row.values.reduce<number>((last, { subcategory, value }) => {
            const subcategoryCategoryId = subcategories.find(({ id }) => id === subcategory)
              ?.categoryId;
            const valueCategory = categories.find(({ id }) => id === subcategoryCategoryId);

            return (
              last +
              (typeof value === 'number' && valueCategory?.category === houseCategory ? value : 0)
            );
          }, 0),
        );

        const homeEquityToPresent = homeValueToPresent.map<number>(
          (value, index) => value - debtToPresent[index],
        );

        const latestDebts = rows[startPredictionIndex - 1].values
          .map<Value>(({ value }) => value)
          .filter(isMortgageValue)
          .map<MortgageValue & { monthlyPayment: number }>((mortgageValue) => ({
            ...mortgageValue,
            monthlyPayment: PMT(mortgageValue),
          }));

        const forecastDebt = Array(rows.length - startPredictionIndex)
          .fill(0)
          .reduce<number[][]>(
            (last) => [
              ...last,
              latestDebts.map<number>((debt, homeIndex) =>
                Math.max(
                  0,
                  last[last.length - 1][homeIndex] * (1 + debt.rate / 100) ** (1 / 12) -
                    debt.monthlyPayment,
                ),
              ),
            ],
            [latestDebts.map<number>((debt) => debt.principal)],
          )
          .slice(1)
          .map<number>((debtStack) => debtStack.reduce<number>((last, debt) => last + debt, 0));

        const latestHomeValue = homeValueToPresent[homeValueToPresent.length - 1];

        const forecastHomeValue = Array(rows.length - startPredictionIndex)
          .fill(0)
          .map(
            (_, index) => latestHomeValue * (1 + assumedHousePriceInflation) ** ((index + 1) / 12),
          );

        const forecastHomeEquity = forecastHomeValue.map<number>(
          (value, index) => value - forecastDebt[index],
        );

        return homeEquityToPresent.concat(forecastHomeEquity);
      },
    ),
  { maxSize: 1 },
);
