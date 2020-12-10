import { compose } from '@typed/compose';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInYears from 'date-fns/differenceInYears';
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

import { lastInArray, sortByKey } from '~client/modules/data';
import { State } from '~client/reducers';
import { getAppConfig } from '~client/selectors/config';
import {
  Aggregate,
  AggregateSums,
  Cost,
  Currency,
  GQL,
  MortgageValue,
  NetWorthCategory,
  NetWorthCategoryType,
  NetWorthEntryNative,
  NetWorthSubcategory,
  NetWorthTableRow as TableRow,
  NetWorthValueObjectNative,
  NetWorthValueObjectRead,
  OptionValue,
} from '~client/types';

const nullEntry = (date: Date): NetWorthEntryNative => ({
  id: -date.getTime(),
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

const getNonFilteredCategories = (state: State): NetWorthCategory[] => state.netWorth.categories;
const getNonFilteredSubcategories = (state: State): NetWorthSubcategory[] =>
  state.netWorth.subcategories;

export const getEntries = (state: State): NetWorthEntryNative[] => state.netWorth.entries;

export const getCategories = createSelector(
  getNonFilteredCategories,
  sortByKey('type', 'category'),
);
export const getSubcategories = createSelector(
  getNonFilteredSubcategories,
  compose<NetWorthSubcategory[], NetWorthSubcategory[], NetWorthSubcategory[]>(
    sortByKey('subcategory'),
    sortByKey('categoryId'),
  ),
);

const withoutSkipValues = (entries: NetWorthEntryNative[]): NetWorthEntryNative[] =>
  entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ skip }) => !skip),
  }));

const getSummaryEntries = createSelector(getEntries, withoutSkipValues);

type FilterPredicate<T> = (value: T) => boolean;

const filterValuesByCategory = (predicate: FilterPredicate<NetWorthCategory>) => (
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
) => (value: NetWorthValueObjectNative): boolean =>
  categories
    .filter(predicate)
    .some((category) =>
      subcategories.some(
        (subcategory) =>
          subcategory.id === value.subcategory && subcategory.categoryId === category.id,
      ),
    );

const filterValuesBySubcategory = (predicate: FilterPredicate<NetWorthSubcategory>) => (
  subcategories: NetWorthSubcategory[],
) => (value: NetWorthValueObjectNative): boolean =>
  subcategories.filter(predicate).some((subcategory) => subcategory.id === value.subcategory);

const isValueSAYE = filterValuesBySubcategory(({ isSAYE }) => !!isSAYE);

const optionValue = (value: GQL<OptionValue>): number =>
  value.vested * Math.max(0, value.marketPrice - value.strikePrice);

function sumComplexValue(value: NetWorthValueObjectNative, currencies: Currency[]): number {
  return Math.round(
    (value.simple ?? 0) +
      (value.fx?.reduce<number>(
        (last, part) =>
          last +
          part.value *
            100 *
            (currencies.find((compare) => compare.currency === part.currency)?.rate ?? 0),
        0,
      ) ?? 0) +
      (value.option ? optionValue(value.option) : 0) +
      -(value.mortgage?.principal ?? 0),
  );
}

const sumValues = (currencies: Currency[], values: NetWorthValueObjectNative[]): number =>
  values.reduce<number>(
    (last, valueObject): number => last + sumComplexValue(valueObject, currencies),
    0,
  );

function calculateResidualSAYEOptionsValue(
  subcategories: NetWorthSubcategory[],
  entry: Pick<NetWorthEntryNative, 'values'>,
): number {
  return Math.round(
    entry.values
      .filter(isValueSAYE(subcategories))
      .reduce<number>(
        (last, { option }) => last + (option ? option.vested * option.strikePrice : 0),
        0,
      ),
  );
}

function getSumByCategory(
  categoryName: Aggregate,
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  { values, currencies }: NetWorthEntryNative,
): number {
  if (!(categories.length && subcategories.length)) {
    return 0;
  }

  const filterToCategory = filterValuesByCategory(({ category }) => category === categoryName);

  const valuesFiltered = values.filter(filterToCategory(categories, subcategories));

  return sumValues(currencies, valuesFiltered);
}

function getAggregateExtra(
  categoryName: Aggregate,
  subcategories: NetWorthSubcategory[],
  entry: NetWorthEntryNative,
): number {
  if (categoryName === Aggregate.cashOther) {
    return calculateResidualSAYEOptionsValue(subcategories, entry);
  }
  return 0;
}

const getEntryAggregate = (
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  entry: NetWorthEntryNative,
): AggregateSums =>
  Object.entries(Aggregate).reduce<AggregateSums>(
    (last, [, categoryName]) => ({
      ...last,
      [categoryName]:
        getSumByCategory(categoryName, categories, subcategories, entry) +
        getAggregateExtra(categoryName, subcategories, entry),
    }),
    {} as AggregateSums,
  );

type EntryWithAggregates = NetWorthEntryNative & {
  aggregate: AggregateSums;
};

const withAggregates = (categories: NetWorthCategory[], subcategories: NetWorthSubcategory[]) => (
  rows: NetWorthEntryNative[],
): EntryWithAggregates[] =>
  rows.map((entry) => ({
    ...entry,
    aggregate: getEntryAggregate(categories, subcategories, entry),
  }));

const getEntryForMonth = (entries: NetWorthEntryNative[]) => (date: Date): NetWorthEntryNative => {
  const matchingEntries = entries
    .filter(({ date: entryDate }) => isSameMonth(entryDate, date))
    .sort(({ date: dateA }, { date: dateB }) => Number(dateB) - Number(dateA));

  return lastInArray(matchingEntries) ?? nullEntry(date);
};

const getNetWorthRows = createSelector(getMonthDates, getSummaryEntries, (monthDates, entries) =>
  monthDates.map(getEntryForMonth(entries)),
);

const getValues = (subcategories: NetWorthSubcategory[]) => ({
  currencies,
  values,
}: NetWorthEntryNative): number =>
  sumValues(
    currencies,
    values.filter((value) => !value.option),
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
  categoryType: NetWorthCategoryType,
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  { currencies, values }: NetWorthEntryNative,
  categoryPredicate: (category: NetWorthCategory) => boolean = (): true => true,
): number =>
  sumValues(
    currencies,
    values.filter(
      filterValuesByCategory(
        (category) => category.type === categoryType && categoryPredicate(category),
      )(categories, subcategories),
    ),
  );

type EntryTypeSplit = EntryWithAggregates & {
  assets: number;
  options: number;
  liabilities: number;
};

const withTypeSplit = (categories: NetWorthCategory[], subcategories: NetWorthSubcategory[]) => (
  rows: EntryWithAggregates[],
): EntryTypeSplit[] =>
  rows.map((entry) => ({
    ...entry,
    assets:
      sumByType(
        NetWorthCategoryType.Asset,
        categories,
        subcategories,
        entry,
        (category) => !category.isOption,
      ) + calculateResidualSAYEOptionsValue(subcategories, entry),
    options: sumByType(
      NetWorthCategoryType.Asset,
      categories,
      subcategories,
      entry,
      (category) => !!category.isOption,
    ),
    liabilities: -sumByType(NetWorthCategoryType.Liability, categories, subcategories, entry),
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

const withFTI = (birthDate: Date) => (rows: EntryWithSpend[]): EntryWithFTI[] =>
  rows.map((entry, index) => {
    const fullYears = differenceInYears(entry.date, birthDate);
    const days = differenceInDays(entry.date, startOfYear(entry.date));
    const years = fullYears + days / 365;

    const pastYear = rows.slice(Math.max(0, index - 11), index + 1);
    const pastYearSpend = pastYear.reduce((sum, { expenses }) => sum + expenses, 0);
    const pastYearAverageSpend = (pastYearSpend * 12) / pastYear.length;

    const fti = Math.round((entry.assets - entry.liabilities) * (years / pastYearAverageSpend));

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
    categories: NetWorthCategory[],
    subcategories: NetWorthSubcategory[],
    entries: NetWorthEntryNative[],
  ) =>
    compose(
      withTableProps,
      withFTI(appConfig.birthDate),
      withSpend(dates, getSpendingColumn(dates)(costMap).spending),
      withTypeSplit(categories, subcategories),
      withAggregates(categories, subcategories),
    )(entries),
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
            row.values.reduce<number>((last, { mortgage }) => last + (mortgage?.principal ?? 0), 0),
          );

        const filterValuesByHouse = filterValuesByCategory(
          ({ category }) => category === houseCategory,
        )(categories, subcategories);

        const homeValueToPresent = rows
          .slice(0, startPredictionIndex)
          .map<number>((row) =>
            row.values
              .filter(filterValuesByHouse)
              .reduce<number>((last, { simple }) => last + (simple ?? 0), 0),
          );

        const homeEquityToPresent = homeValueToPresent.map<number>(
          (value, index) => value - debtToPresent[index],
        );

        const latestDebts = rows[startPredictionIndex - 1].values
          .filter(
            (value): value is NetWorthValueObjectRead & { mortgage: MortgageValue } =>
              !!value.mortgage,
          )
          .map<MortgageValue & { monthlyPayment: number }>(({ mortgage }) => ({
            ...mortgage,
            monthlyPayment: PMT(mortgage),
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
