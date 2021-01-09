import { compose } from '@typed/compose';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInYears from 'date-fns/differenceInYears';
import isSameMonth from 'date-fns/isSameMonth';
import startOfYear from 'date-fns/startOfYear';
import groupBy from 'lodash/groupBy';
import moize from 'moize';
import { rgba } from 'polished';
import { createSelector } from 'reselect';

import {
  getCost,
  getSpendingColumn,
  getMonthDates,
  getFutureMonths,
  currentDayIsEndOfMonth,
} from './common';

import { getText } from '~client/components/net-worth/breakdown.blocks';
import { blockPacker } from '~client/modules/block-packer';
import { lastInArray, sortByKey } from '~client/modules/data';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { State } from '~client/reducers';
import { getAppConfig } from '~client/selectors/config';
import { colors } from '~client/styled/variables';
import type {
  AggregateSums,
  BlockItem,
  FlexBlocks,
  GQL,
  NetWorthEntryNative,
  NetWorthTableRow as TableRow,
  NetWorthValueObjectNative,
  NetWorthValueObjectRead,
  WithSubTree,
} from '~client/types';
import { Aggregate, NetWorthCategoryType } from '~client/types/enum';
import type {
  Cost,
  Currency,
  MortgageValue,
  NetWorthCategory,
  NetWorthSubcategory,
  OptionValue,
} from '~client/types/gql';

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

const residualSAYEValue = (option: GQL<OptionValue>): number => option.vested * option.strikePrice;

const optionValue = (option: GQL<OptionValue>, isSAYE: boolean, withSAYEResidual = false): number =>
  option.vested * Math.max(0, option.marketPrice - option.strikePrice) +
  (withSAYEResidual && isSAYE ? residualSAYEValue(option) : 0);

function sumComplexValue(
  value: NetWorthValueObjectNative,
  currencies: Currency[],
  subcategories: NetWorthSubcategory[],
  withSAYEResidual = false,
): number {
  const isSAYE = isValueSAYE(subcategories);

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
      (value.option ? optionValue(value.option, isSAYE(value), withSAYEResidual) : 0) +
      -(value.mortgage?.principal ?? 0),
  );
}

const sumValues = (
  currencies: Currency[],
  subcategories: NetWorthSubcategory[],
  values: NetWorthValueObjectNative[],
  withSAYEResidual = false,
): number =>
  values.reduce<number>(
    (last, valueObject): number =>
      last + sumComplexValue(valueObject, currencies, subcategories, withSAYEResidual),
    0,
  );

function calculateResidualSAYEOptionsValue(
  subcategories: NetWorthSubcategory[],
  entry: Pick<NetWorthEntryNative, 'values'>,
): number {
  return Math.round(
    entry.values
      .filter(isValueSAYE(subcategories))
      .reduce<number>((last, { option }) => last + (option ? residualSAYEValue(option) : 0), 0),
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

  return sumValues(currencies, subcategories, valuesFiltered, false);
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
    subcategories,
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
    subcategories,
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
      withFTI(new Date(appConfig.birthDate)),
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

type ValueInfo = {
  category: NetWorthCategory;
  subcategory: NetWorthSubcategory;
};

type ValueWithInfo = NetWorthValueObjectNative & { info: ValueInfo };

function addInfoToValues(
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  values: NetWorthValueObjectNative[],
): ValueWithInfo[] {
  return values.map<
    NetWorthValueObjectNative & {
      info: { category: NetWorthCategory; subcategory: NetWorthSubcategory };
    }
  >((value) => {
    const subcategory = subcategories.find(
      (compare) => compare.id === value.subcategory,
    ) as NetWorthSubcategory;
    const category = categories.find(
      (compare) => compare.id === subcategory?.categoryId,
    ) as NetWorthCategory;

    return {
      ...value,
      info: { category, subcategory },
    };
  });
}

type CategoryTreeOptions = {
  name: string;
  categoryType: NetWorthCategoryType;
  color: string;
  factor: -1 | 1;
};

const categoryTreeBuilder = (
  currencies: Currency[],
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  values: ValueWithInfo[],
) => (trees: CategoryTreeOptions[], normalise = false): WithSubTree<BlockItem>[] => {
  const treeValues = trees.map<
    CategoryTreeOptions & {
      groups: Record<string, ValueWithInfo[]>;
      sumTotal: number;
    }
  >((options) => {
    const filteredValues = values.filter(
      filterValuesByCategory(({ type }) => type === options.categoryType)(
        categories,
        subcategories,
      ),
    );

    const groups = groupBy(filteredValues, 'info.category.category');
    const sumTotal = options.factor * sumValues(currencies, subcategories, filteredValues, true);

    return { ...options, groups, sumTotal };
  });

  const maxSumTotal = treeValues.reduce((last, { sumTotal }) => Math.max(last, sumTotal), 0);

  const normalisedTrees = treeValues.map<WithSubTree<BlockItem>>(
    ({ name, color, factor, groups, sumTotal }) => ({
      name: `${name} (${formatCurrency(sumTotal, { abbreviate: true })})`,
      text: getText(name, 0),
      total: normalise ? maxSumTotal : sumTotal,
      color,
      subTree: Object.entries(groups).map<WithSubTree<BlockItem>>(([category, group]) => {
        const subTotal = factor * sumValues(currencies, subcategories, group, true);
        const ratio = subTotal / sumTotal;

        return {
          name: `${category} (${formatCurrency(subTotal, {
            abbreviate: true,
          })}) [${formatPercent(ratio, { precision: 1 })}]`,
          text: getText(category, 1),
          total: subTotal * (normalise ? maxSumTotal / sumTotal : 1),
          color: group[0]?.info.category.color ?? colors.white,
          subTree: group.map<BlockItem>((value) => {
            const itemValue = factor * sumValues(currencies, subcategories, [value], true);
            return {
              name: `${value.info.subcategory.subcategory} (${formatCurrency(itemValue, {
                abbreviate: true,
              })})`,
              total: itemValue * (normalise ? maxSumTotal / sumTotal : 1),
              text: getText(value.info.subcategory.subcategory, 2),
              color: rgba(colors.white, (value.info.subcategory.opacity ?? 1) / 2),
            };
          }),
        };
      }),
    }),
  );

  return normalisedTrees;
};

export const getNetWorthBreakdown = moize(
  ({ values, currencies }: NetWorthEntryNative, width: number, height: number) =>
    createSelector(
      getCategories,
      getSubcategories,
      (categories, subcategories): FlexBlocks<BlockItem> | null => {
        if (!(width && height)) {
          return null;
        }

        const valuesWithInfo = addInfoToValues(
          categories,
          subcategories,
          values.filter(({ skip }) => !skip),
        );

        const buildCategoryTree = categoryTreeBuilder(
          currencies,
          categories,
          subcategories,
          valuesWithInfo,
        );

        const tree: WithSubTree<BlockItem>[] = buildCategoryTree([
          {
            name: 'Assets',
            categoryType: NetWorthCategoryType.Asset,
            color: colors.netWorth.assets,
            factor: 1,
          },
          {
            name: 'Liabilities',
            categoryType: NetWorthCategoryType.Liability,
            color: colors.netWorth.liabilities,
            factor: -1,
          },
        ]);

        return blockPacker(width, height, tree);
      },
    ),
  { maxSize: 1 },
);
