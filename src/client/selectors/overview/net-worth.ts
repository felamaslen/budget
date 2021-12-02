import { compose } from '@typed/compose';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInYears from 'date-fns/differenceInYears';
import endOfMonth from 'date-fns/endOfMonth';
import isBefore from 'date-fns/isBefore';
import isSameMonth from 'date-fns/isSameMonth';
import startOfDay from 'date-fns/startOfDay';
import startOfYear from 'date-fns/startOfYear';
import groupBy from 'lodash/groupBy';
import moize from 'moize';
import { rgba } from 'polished';
import { createSelector } from 'reselect';

import { getMonthDates, getGraphDates, getStartPredictionIndex } from './common';
import { getCategories, getEntries, getMonthlyValues, getSubcategories } from './direct';
import { getSpendingColumn, longTermOptionsDisabled, roundedNumbers } from './utils';

import { getText } from '~client/components/net-worth/breakdown.blocks';
import { lastInArray } from '~client/modules/data';
import { forecastCompoundedReturns } from '~client/modules/finance';
import { formatCurrency, formatPercent } from '~client/modules/format';
import { getAppConfig } from '~client/selectors/config';
import { colors } from '~client/styled/variables';
import type {
  BlockItem,
  LongTermOptions,
  NetWorthAggregateSums as AggregateSums,
  NetWorthEntryInputNative,
  NetWorthEntryNative,
  NetWorthTableRow as TableRow,
  NetWorthValueObjectNative,
  NetWorthValueObjectRead,
  OverviewGraphDate,
  WithSubTree,
  WithSubTreeRecursive,
} from '~client/types';
import { NetWorthCategoryType } from '~client/types/enum';
import type {
  Currency,
  LoanValue,
  NetWorthCategory,
  NetWorthSubcategory,
  NetWorthValueInput,
  OptionValue,
  OptionValueInput,
} from '~client/types/gql';
import { NetWorthAggregate as Aggregate } from '~shared/constants';
import type { GQL } from '~shared/types';

export { getCategories, getEntries, getSubcategories } from './direct';

const nullEntry = (date: Date): NetWorthEntryNative => ({
  id: -date.getTime(),
  date,
  values: [],
  currencies: [],
  creditLimit: [],
});

const withoutSkipValues = (entries: NetWorthEntryNative[]): NetWorthEntryNative[] =>
  entries.map(({ values, ...rest }) => ({
    ...rest,
    values: values.filter(({ skip }) => !skip),
  }));

const getSummaryEntries = createSelector(getEntries, withoutSkipValues);

type FilterPredicate<T> = (value: T) => boolean;

const filterValuesByCategory =
  (predicate: FilterPredicate<NetWorthCategory>) =>
  (categories: NetWorthCategory[], subcategories: NetWorthSubcategory[]) =>
  (value: NetWorthValueObjectNative | NetWorthValueInput): boolean =>
    categories
      .filter(predicate)
      .some((category) =>
        subcategories.some(
          (subcategory) =>
            subcategory.id === value.subcategory && subcategory.categoryId === category.id,
        ),
      );

const filterValuesBySubcategory =
  (predicate: FilterPredicate<NetWorthSubcategory>) =>
  (subcategories: NetWorthSubcategory[]) =>
  (value: NetWorthValueObjectNative | NetWorthValueInput): boolean =>
    subcategories.filter(predicate).some((subcategory) => subcategory.id === value.subcategory);

const isValueSAYE = filterValuesBySubcategory(({ isSAYE }) => !!isSAYE);

const residualSAYEValue = (option: GQL<OptionValue> | OptionValueInput): number =>
  (option.vested ?? 0) * option.strikePrice;

const optionValue = (
  option: GQL<OptionValue> | OptionValueInput,
  isSAYE: boolean,
  withSAYEResidual = false,
): number =>
  (option.vested ?? 0) * Math.max(0, option.marketPrice - option.strikePrice) +
  (withSAYEResidual && isSAYE ? residualSAYEValue(option) : 0);

export function sumComplexValue(
  value: NetWorthValueObjectNative | NetWorthValueInput,
  currencies: Currency[],
  subcategories: NetWorthSubcategory[],
  withSAYEResidual = false,
): number {
  const isSAYE = isValueSAYE(subcategories);

  return (
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
    -(value.loan?.principal ?? 0)
  );
}

const sumValues = (
  currencies: Currency[],
  subcategories: NetWorthSubcategory[],
  values: (NetWorthValueObjectNative | NetWorthValueInput)[],
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
  return entry.values
    .filter(isValueSAYE(subcategories))
    .reduce<number>((last, { option }) => last + (option ? residualSAYEValue(option) : 0), 0);
}

type MonthlyDeposit = { deposit: number; profit: number };

export function calculatePredictedSAYEMonthlyDeposit(
  subcategories: NetWorthSubcategory[],
  entries: NetWorthEntryNative[],
  startPredictionIndex: number,
): MonthlyDeposit {
  const zeroDeposit: MonthlyDeposit = { deposit: 0, profit: 0 };
  if (startPredictionIndex === -1) {
    return zeroDeposit;
  }
  const currentEntry = entries[startPredictionIndex - 1];
  const previousEntries = entries.slice(0, startPredictionIndex - 1).reverse();
  if (!(currentEntry && previousEntries.length > 0)) {
    return zeroDeposit;
  }
  return currentEntry.values
    .filter(isValueSAYE(subcategories))
    .reduce<MonthlyDeposit>((last, value) => {
      const vested = value.option?.vested ?? 0;
      if (vested >= (value.option?.units ?? 0)) {
        return last;
      }
      const previousEntryWithOption = previousEntries.find((entry) =>
        entry.values.some((compare) => compare.subcategory === value.subcategory),
      );
      if (!previousEntryWithOption) {
        return last;
      }
      const previousVestedUnits =
        previousEntryWithOption.values.find((compare) => compare.subcategory === value.subcategory)
          ?.option?.vested ?? 0;

      const vestRateUnits =
        (vested - previousVestedUnits) /
          Math.max(
            1,
            differenceInCalendarMonths(currentEntry.date, previousEntryWithOption.date),
          ) || 0;

      const monthlyDeposit = vestRateUnits * (value.option?.strikePrice ?? 0);
      const monthlyProfit =
        vestRateUnits * ((value.option?.marketPrice ?? 0) - (value.option?.strikePrice ?? 0));

      return { deposit: last.deposit + monthlyDeposit, profit: last.profit + monthlyProfit };
    }, zeroDeposit);
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

const getEntryAggregate = (
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  entry: NetWorthEntryNative,
  extra: Partial<Record<Aggregate, number>> = {},
): AggregateSums =>
  Object.entries(Aggregate).reduce<AggregateSums>(
    (last, [, categoryName]) => ({
      ...last,
      [categoryName]:
        getSumByCategory(categoryName, categories, subcategories, entry) +
        (extra[categoryName] ?? 0),
    }),
    {} as AggregateSums,
  );

export type EntryWithAggregates = NetWorthEntryNative & {
  aggregate: AggregateSums;
};

export const withAggregates =
  (categories: NetWorthCategory[], subcategories: NetWorthSubcategory[]) =>
  (rows: NetWorthEntryNative[]): EntryWithAggregates[] =>
    rows.map((entry) => ({
      ...entry,
      aggregate: getEntryAggregate(categories, subcategories, entry, {
        [Aggregate.cashOther]: calculateResidualSAYEOptionsValue(subcategories, entry),
      }),
    }));

const getEntryForMonth =
  (entries: NetWorthEntryNative[]) =>
  (date: Date): NetWorthEntryNative => {
    const matchingEntries = entries
      .filter(({ date: entryDate }) => isSameMonth(entryDate, date))
      .sort(({ date: dateA }, { date: dateB }) => Number(dateB) - Number(dateA));

    return lastInArray(matchingEntries) ?? nullEntry(date);
  };

export const getNetWorthRows = createSelector(
  getMonthDates,
  getSummaryEntries,
  (monthDates, entries) => monthDates.map(getEntryForMonth(entries)),
);

export const sumByType = (
  categoryType: NetWorthCategoryType,
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  { currencies, values }: NetWorthEntryNative | NetWorthEntryInputNative,
  categoryPredicate?: (category: NetWorthCategory) => boolean,
): number =>
  sumValues(
    currencies,
    subcategories,
    values.filter(
      filterValuesByCategory(
        (category) =>
          category.type === categoryType && (!categoryPredicate || categoryPredicate(category)),
      )(categories, subcategories),
    ),
  );

type EntryTypeSplit = EntryWithAggregates & {
  assets: number;
  options: number;
  liabilities: number;
};

const withTypeSplit =
  (categories: NetWorthCategory[], subcategories: NetWorthSubcategory[]) =>
  (rows: EntryWithAggregates[]): EntryTypeSplit[] =>
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

const withSpend =
  (dates: Date[], spending: number[]) =>
  (rows: EntryTypeSplit[]): EntryWithSpend[] =>
    rows.map((entry) => ({
      ...entry,
      expenses: getSpendingByDate(spending, dates, entry.date),
    }));

export type EntryWithFTI = EntryWithSpend & { fti: number; pastYearAverageSpend: number };

const withFTI =
  (birthDate: Date) =>
  (rows: EntryWithSpend[]): EntryWithFTI[] =>
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
  rows.map(({ values, creditLimit, currencies, ...rest }) =>
    roundedNumbers<EntryWithTableProps>({
      ...rest,
      aggregate: roundedNumbers(rest.aggregate),
    }),
  );

const getNetWorthPropsDeriver = createSelector(
  getAppConfig,
  getMonthlyValues,
  getMonthDates,
  getCategories,
  getSubcategories,
  (appConfig, monthly, dates, categories, subcategories) =>
    compose(
      withFTI(new Date(appConfig.birthDate)),
      withSpend(dates, getSpendingColumn(monthly, dates.length)),
      withTypeSplit(categories, subcategories),
      withAggregates(categories, subcategories),
    ),
);

export const getDerivedNetWorthEntries = createSelector(
  getNetWorthPropsDeriver,
  getNetWorthRows,
  (deriver, entries) => deriver(entries),
);

export const getNetWorthTable = createSelector(
  getNetWorthPropsDeriver,
  getSummaryEntries,
  (deriver, entries) => compose(withTableProps, deriver)(entries),
);

export const getLatestNetWorthAggregate = moize(
  (today: Date) =>
    createSelector(
      getNetWorthTable,
      (netWorth) =>
        netWorth
          .slice()
          .reverse()
          .find(({ date }) => isBefore(startOfDay(date), endOfMonth(today)))?.aggregate,
    ),
  { maxSize: 1 },
);

export function PMT({ principal, paymentsRemaining, rate }: LoanValue): number {
  if (!paymentsRemaining) {
    return 0;
  }
  if (!rate) {
    return principal / paymentsRemaining;
  }
  const monthlyRate = (1 + rate / 100) ** (1 / 12) - 1;
  return (monthlyRate * principal) / (1 - (1 + monthlyRate) ** -paymentsRemaining);
}

export type IlliquidEquity = { value: number; debt: number };

type CompoundLoanOrAsset = {
  principal: number;
  interestRate: number;
};

const forecastCompoundStack =
  <T extends CompoundLoanOrAsset>(
    composer: (lastValue: number, monthsSinceLastForecast: number, loanOrAsset: T) => number,
  ) =>
  (dates: OverviewGraphDate[], startPredictionIndex: number, currentStack: T[]): number[] =>
    dates
      .slice(startPredictionIndex)
      .reduce<{ monthIndex: number; values: number[][] }>(
        (last, { monthIndex }) => {
          const monthsSinceLastForecast = monthIndex - last.monthIndex;
          return {
            monthIndex,
            values: [
              ...last.values,
              currentStack.map<number>((loanOrAsset, loanOrAssetIndex) => {
                const lastValue = last.values[last.values.length - 1][loanOrAssetIndex];
                return composer(lastValue, monthsSinceLastForecast, loanOrAsset);
              }),
            ],
          };
        },
        {
          monthIndex: startPredictionIndex - 1,
          values: [currentStack.map<number>(({ principal }) => principal)],
        },
      )
      .values.slice(1)
      .map<number>((stack) => stack.reduce<number>((last, value) => last + value, 0));

export type CompoundLoan = CompoundLoanOrAsset & { monthlyPayment: number; paid: number };

export const forecastCompoundLoanDebt = forecastCompoundStack<CompoundLoan>(
  (principal, monthsSinceLastForecast, loan) =>
    // The debt is forecast in periods of arbitrary length in months
    // But debt is assumed to be repaid monthly, so this is taken into account
    Math.max(
      0,
      forecastCompoundedReturns(
        principal,
        monthsSinceLastForecast,
        -loan.monthlyPayment,
        loan.interestRate / 100,
      ),
    ),
);

const forecastAppreciatingIlliquidAsset = forecastCompoundStack(
  (principal, monthsSinceLastForecast, asset) =>
    forecastCompoundedReturns(principal, monthsSinceLastForecast, 0, asset.interestRate / 100),
);

function getIlliquidAssetValue(
  startPredictionIndex: number,
  dates: OverviewGraphDate[],
  subcategories: NetWorthSubcategory[],
  rows: NetWorthEntryNative[],
): number[] {
  const filterIlliquidValues = filterValuesBySubcategory(
    ({ appreciationRate = null }) => appreciationRate !== null,
  )(subcategories);

  const illiquidValueToPresent = rows
    .slice(0, startPredictionIndex)
    .map<number>((row) =>
      row.values
        .filter(filterIlliquidValues)
        .reduce<number>((last, { simple }) => last + (simple ?? 0), 0),
    );

  const currentIlliquidAssets = rows[startPredictionIndex - 1].values
    .filter(filterIlliquidValues)
    .map<CompoundLoanOrAsset>(({ simple, subcategory }) => ({
      principal: simple ?? 0,
      // appreciation rates are always in %
      interestRate:
        subcategories.find((compare) => compare.id === subcategory)?.appreciationRate ?? 0,
    }));

  const forecastIlliquidValue = forecastAppreciatingIlliquidAsset(
    dates,
    startPredictionIndex,
    currentIlliquidAssets,
  );

  return illiquidValueToPresent.concat(forecastIlliquidValue);
}

function getLoanDebt(
  startPredictionIndex: number,
  dates: OverviewGraphDate[],
  rows: NetWorthEntryNative[],
): number[] {
  const debtToPresent = rows
    .slice(0, startPredictionIndex)
    .map<number>((row) =>
      row.values.reduce<number>((last, { loan }) => last + (loan?.principal ?? 0), 0),
    );

  const outstandingLoans = rows[startPredictionIndex - 1].values
    .filter((value): value is NetWorthValueObjectRead & { loan: LoanValue } => !!value.loan)
    .map<CompoundLoan>(({ loan }) => ({
      principal: loan.principal,
      interestRate: loan.rate,
      monthlyPayment: PMT(loan),
      paid: loan.paid ?? 0,
    }));

  const forecastDebt = forecastCompoundLoanDebt(dates, startPredictionIndex, outstandingLoans);

  return debtToPresent.concat(forecastDebt);
}

export const getIlliquidEquity = moize(
  (today: Date, longTermOptions: LongTermOptions = longTermOptionsDisabled) =>
    createSelector(
      getStartPredictionIndex(today),
      getGraphDates(today, longTermOptions),
      getSubcategories,
      getNetWorthRows,
      (startPredictionIndex, dates, subcategories, rows): IlliquidEquity[] => {
        if (rows.length < startPredictionIndex) {
          return [];
        }

        const illiquidAssetValue = getIlliquidAssetValue(
          startPredictionIndex,
          dates,
          subcategories,
          rows,
        );
        const loanDebt = getLoanDebt(startPredictionIndex, dates, rows);

        return illiquidAssetValue.map<IlliquidEquity>((value, index) => ({
          value,
          debt: -loanDebt[index],
        }));
      },
    ),
  { maxSize: 1 },
);

type ValueInfo = Partial<{
  category: NetWorthCategory;
  subcategory: NetWorthSubcategory;
}>;

type ValueWithInfo = NetWorthValueObjectNative & { info: ValueInfo };

function addInfoToValues(
  categories: NetWorthCategory[],
  subcategories: NetWorthSubcategory[],
  values: NetWorthValueObjectNative[],
): ValueWithInfo[] {
  return values.map<ValueWithInfo>((value) => {
    const subcategory = subcategories.find((compare) => compare.id === value.subcategory);
    const category = categories.find((compare) => compare.id === subcategory?.categoryId);

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

const categoryTreeBuilder =
  (
    currencies: Currency[],
    categories: NetWorthCategory[],
    subcategories: NetWorthSubcategory[],
    values: ValueWithInfo[],
  ) =>
  (trees: CategoryTreeOptions[], normalise = false): WithSubTree<BlockItem>[] => {
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
        total: Math.round(normalise ? maxSumTotal : sumTotal),
        color,
        subTree: Object.entries(groups).map<WithSubTree<BlockItem>>(([category, group]) => {
          const subTotal = factor * sumValues(currencies, subcategories, group, true);
          const ratio = subTotal / sumTotal;

          return {
            name: `${category} (${formatCurrency(subTotal, { abbreviate: true })}) [${formatPercent(
              ratio,
              { precision: 1 },
            )}]`,
            text: getText(category, 1),
            total: subTotal * (normalise ? maxSumTotal / sumTotal : 1),
            color: group[0]?.info.category?.color ?? colors.white,
            subTree: group.map<BlockItem>((value) => {
              const itemValue = factor * sumValues(currencies, subcategories, [value], true);
              return {
                name: `${value.info.subcategory?.subcategory ?? '<Unknown>'} (${formatCurrency(
                  itemValue,
                  { abbreviate: true },
                )})`,
                total: itemValue * (normalise ? maxSumTotal / sumTotal : 1),
                text: getText(value.info.subcategory?.subcategory ?? '<Unknown>', 2),
                color: rgba(colors.white, (value.info.subcategory?.opacity ?? 1) / 2),
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
      (categories, subcategories): WithSubTreeRecursive<BlockItem>[] | null => {
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

        return buildCategoryTree([
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
      },
    ),
  { maxSize: 1 },
);
