import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import getMonth from 'date-fns/getMonth';
import getYear from 'date-fns/getYear';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { getFutureMonths, getMonthDates, getGraphDates, getStartPredictionIndex } from './common';
import { getAnnualisedFundReturns, getMonthlyValues, getSubcategories } from './direct';
import {
  calculatePredictedSAYEMonthlyDeposit,
  EntryWithFTI,
  getDerivedNetWorthEntries,
  getIlliquidEquity,
  IlliquidEquity,
} from './net-worth';
import {
  forecastCompoundedReturns,
  longTermOptionsDisabled,
  reduceDates,
  roundedArrays,
  withSpendingColumn,
} from './utils';

import { Average, GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS } from '~client/constants';
import { OVERVIEW_COLUMNS } from '~client/constants/data';
import { getOverviewScoreColor, overviewCategoryColor } from '~client/modules/color';
import { arrayAverage, getTotalCost, omitTypeName, rightPad } from '~client/modules/data';
import { State } from '~client/reducers';
import {
  filterPastTransactions,
  getFundsCachedValue,
  getFundsCostToDate,
} from '~client/selectors/funds';
import { getFundsRows } from '~client/selectors/funds/helpers';
import {
  FundNative as Fund,
  GQL,
  LongTermOptions,
  LongTermRates,
  Median,
  OverviewGraph,
  OverviewGraphDate as GraphDate,
  OverviewGraphPartial,
  OverviewGraphRequired,
  OverviewGraphValues,
  OverviewTable,
  OverviewTableRow,
  SplitRange,
  TableValues,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { Monthly, NetWorthSubcategory } from '~client/types/gql';
import { NetWorthAggregate } from '~shared/constants';

export * from './common';
export * from './net-worth';

type Category = keyof GQL<Monthly>;

export const getLongTermRates = moize(
  (today: Date) =>
    createSelector(
      getMonthlyValues,
      getAnnualisedFundReturns,
      getStartPredictionIndex(today),
      (monthly, xirr, startPredictionIndex): LongTermRates => ({
        years: GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS,
        income: arrayAverage(monthly.income.slice(0, startPredictionIndex), Average.Exp),
        stockPurchase: arrayAverage(monthly.investmentPurchases.slice(0, startPredictionIndex)),
        xirr,
      }),
    ),
  { maxSize: 1 },
);

const futureCategories: Category[] = [
  PageListStandard.Food,
  PageListStandard.General,
  PageListStandard.Holiday,
  PageListStandard.Social,
];

const extrapolateCurrentMonthCategories: Category[] = [
  PageListStandard.Food,
  PageListStandard.Social,
];

const getMonthlyStockPurchase = (
  longTermOptions: LongTermOptions,
  longTermRates: LongTermRates,
): number =>
  longTermOptions.enabled
    ? longTermOptions.rates.stockPurchase ?? longTermRates.stockPurchase
    : longTermRates.stockPurchase;

const withNetWorth = <
  G extends Partial<OverviewGraphValues> &
    Pick<OverviewGraphValues, 'income' | 'spending' | AggregateKey | 'stocks' | 'stockCostBasis'>
>(
  dates: GraphDate[],
  startPredictionIndex: number,
  netWorth: EntryWithFTI[],
  funds: Fund[],
  illiquidEquity: IlliquidEquity[],
  longTermOptions: LongTermOptions,
  longTermRates: LongTermRates,
) => (
  graph: G,
): G & Pick<OverviewGraphValues, 'netWorth' | 'assets' | 'liabilities' | 'illiquidEquity'> => {
  const monthlyStockPurchase = getMonthlyStockPurchase(longTermOptions, longTermRates);

  const assets = dates.reduce<number[]>((last, { date }, index) => {
    if (index < startPredictionIndex) {
      return [...last, netWorth[index].assets];
    }

    const fundCosts =
      getFundsCostToDate(date, funds) -
      (index > 0 ? getFundsCostToDate(dates[index - 1].date, funds) : 0);

    const income = graph.income[index];
    const spending = graph.spending[index] + fundCosts;

    const stockReturn = graph.stocks[index] - graph.stocks[index - 1] - monthlyStockPurchase;

    const illiquidAppreciation = illiquidEquity[index].value - illiquidEquity[index - 1].value;
    const otherCashChange = graph.cashOther[index] - graph.cashOther[index - 1];

    const netChange = income - spending + stockReturn + illiquidAppreciation + otherCashChange;

    return [...last, last[last.length - 1] + netChange];
  }, []);

  const liabilities = dates.reduce<number[]>((last, _, index) => {
    if (index < startPredictionIndex) {
      return [...last, -netWorth[index].liabilities];
    }
    const loanDebtChange = illiquidEquity[index].debt - illiquidEquity[index - 1].debt;
    return [...last, last[last.length - 1] + loanDebtChange];
  }, []);

  return {
    ...graph,
    assets,
    liabilities,
    netWorth: assets.map((value, index) => value + liabilities[index]),
    illiquidEquity: illiquidEquity.map(({ value, debt }) => value + debt),
  };
};

function predictByPastAverages(
  dates: GraphDate[],
  currentIndex: number,
  currentMonthRatio: number,
  category: Category,
  presentValues: number[],
  averageMode: Average = Average.Median,
): number[] {
  const currentItems = extrapolateCurrentMonthCategories.includes(category)
    ? replaceAtIndex(
        presentValues.slice(0, currentIndex + 1),
        currentIndex,
        Math.round(presentValues[currentIndex] * currentMonthRatio),
      )
    : presentValues.slice(0, currentIndex + 1);

  const average = Math.round(arrayAverage(currentItems, averageMode));

  return reduceDates(
    dates.slice(currentIndex + 1),
    (last, nextDate, prevDate) => [...last, average * (nextDate.monthIndex - prevDate.monthIndex)],
    dates[currentIndex],
    currentItems,
  );
}

function predictIncome(
  dates: GraphDate[],
  currentIndex: number,
  currentIncome: number[],
  longTermOptions: LongTermOptions,
): number[] {
  if (!longTermOptions.enabled || typeof longTermOptions.rates.income === 'undefined') {
    return predictByPastAverages(dates, currentIndex, 0, 'income', currentIncome, Average.Exp);
  }

  return reduceDates(
    dates.slice(currentIndex + 1),
    (last, nextDate, prevDate) => [
      ...last,
      (longTermOptions.rates.income as number) * (nextDate.monthIndex - prevDate.monthIndex),
    ],
    dates[currentIndex],
    currentIncome.slice(0, currentIndex + 1),
  );
}

function calculateFutures<G extends OverviewGraphPartial>(
  dates: GraphDate[],
  today: Date,
  longTermOptions: LongTermOptions,
): (graph: G) => G {
  const currentMonthRatio = getDaysInMonth(today) / getDate(today);
  const currentIndex = dates.findIndex(({ date }) => isSameMonth(date, today));

  return (graph: G): G =>
    futureCategories.reduce<G>(
      (last, category) => ({
        ...last,
        [category]: predictByPastAverages(
          dates,
          currentIndex,
          currentMonthRatio,
          category,
          graph[category],
        ),
      }),
      {
        ...graph,
        income: predictIncome(dates, currentIndex, graph.income, longTermOptions),
        bills: longTermOptions.enabled
          ? predictByPastAverages(dates, currentIndex, currentMonthRatio, 'bills', graph.bills)
          : graph.bills,
        investmentPurchases: rightPad(graph.investmentPurchases, dates.length, 0),
      },
    );
}

const withNetChange = <G extends OverviewGraphRequired<'spending'>>() => (
  graph: G,
): OverviewGraphRequired<'net', G> => ({
  ...graph,
  net: graph.income.map((value, index) => value - graph.spending[index]),
});

const withPredictedSpending = <G extends OverviewGraphPartial>(
  dates: GraphDate[],
  today: Date,
  longTermOptions: LongTermOptions,
): ((graph: G) => OverviewGraphRequired<'spending' | 'net', G>) =>
  compose<G, G, OverviewGraphRequired<'spending', G>, OverviewGraphRequired<'spending' | 'net', G>>(
    withNetChange(),
    withSpendingColumn(dates.length),
    calculateFutures(dates, today, longTermOptions),
  );

const predictStockReturns = (
  dates: GraphDate[],
  annualisedFundReturns: number,
  monthlyStockPurchase: number,
) => (stocks: number[]): number[] =>
  reduceDates(
    dates.slice(stocks.length),
    (last, nextDate, prevDate) => [
      ...last,
      forecastCompoundedReturns(
        last[last.length - 1],
        nextDate.monthIndex - prevDate.monthIndex,
        monthlyStockPurchase,
        annualisedFundReturns,
      ),
    ],
    dates[stocks.length - 1],
    stocks,
  );

const withCurrentStockValue = (currentStockValue: number) => (stocks: number[]): number[] =>
  replaceAtIndex(stocks, stocks.length - 1, currentStockValue);

const getStockCostBasis = (
  dates: GraphDate[],
  monthlyStockPurchase: number,
  numOldMonths: number,
  startPredictionIndex: number,
  funds: Fund[],
): number[] =>
  Array(numOldMonths)
    .fill(0)
    .map<GraphDate>((_, index) => ({
      date: endOfMonth(addMonths(dates[0].date, index - numOldMonths)),
      monthIndex: index - numOldMonths,
    }))
    .concat(dates)
    .map<number>(({ date, monthIndex }) =>
      funds.reduce<number>(
        (last, fund) => last + getTotalCost(filterPastTransactions(date, fund.transactions)),
        monthlyStockPurchase * Math.max(0, monthIndex - startPredictionIndex + 1),
      ),
    );

const withStocks = <G extends OverviewGraphPartial>(
  numOldMonths: number,
  longTermOptions: LongTermOptions,
) => (
  longTermRates: LongTermRates,
  startPredictionIndex: number,
  dates: GraphDate[],
  monthly: Monthly,
  funds: Fund[],
  fundsCachedValue: { value: number },
  annualisedFundReturns: number,
) => (graph: G): OverviewGraphRequired<'stocks' | 'stockCostBasis', G> => {
  const monthlyStockPurchase = getMonthlyStockPurchase(longTermOptions, longTermRates);
  const currentStockValue = fundsCachedValue.value;

  return {
    ...graph,
    stocks: compose(
      predictStockReturns(
        dates,
        longTermOptions.enabled
          ? longTermOptions.rates.xirr ?? annualisedFundReturns
          : annualisedFundReturns,
        monthlyStockPurchase,
      ),
      withCurrentStockValue(currentStockValue),
    )(monthly.stocks),
    stockCostBasis: getStockCostBasis(
      dates,
      monthlyStockPurchase,
      numOldMonths,
      startPredictionIndex,
      funds,
    ),
  };
};

type AggregateKey = 'pension' | 'cashOther' | 'options' | 'investments';

function withAggregateNetWorth<G extends Partial<OverviewGraphValues>>(
  dates: GraphDate[],
  startPredictionIndex: number,
  subcategories: NetWorthSubcategory[],
  aggregatedNetWorth: EntryWithFTI[],
  longTermOptions: LongTermOptions,
  longTermRates: LongTermRates,
): (graph: G) => G & Pick<OverviewGraphValues, AggregateKey> {
  const currentEntries = aggregatedNetWorth.slice(0, startPredictionIndex);
  const fillCurrent = (values: number[]): number[] => rightPad(values, dates.length);
  const fillAggregate = (key: NetWorthAggregate): number[] =>
    fillCurrent(currentEntries.map(({ aggregate }) => aggregate[key]));

  const { deposit: sayeDeposit, profit: sayeProfit } = calculatePredictedSAYEMonthlyDeposit(
    subcategories,
    aggregatedNetWorth,
    startPredictionIndex,
  );

  const monthlyStockPurchase = getMonthlyStockPurchase(longTermOptions, longTermRates);
  const currentInvestmentsValue =
    currentEntries[currentEntries.length - 1]?.aggregate[NetWorthAggregate.stocks] ?? 0;

  return (graph: G): G & Pick<OverviewGraphValues, AggregateKey> => ({
    ...graph,
    pension: fillAggregate(NetWorthAggregate.pension),
    cashOther: fillAggregate(NetWorthAggregate.cashOther).map(
      (value, index) =>
        value + sayeDeposit * Math.max(0, dates[index].monthIndex - (startPredictionIndex - 1)),
    ),
    investments: currentEntries
      .map(({ aggregate }) => aggregate[NetWorthAggregate.stocks])
      .concat(
        dates
          .slice(currentEntries.length)
          .map<number>(
            ({ monthIndex }) =>
              currentInvestmentsValue + monthlyStockPurchase * (monthIndex - startPredictionIndex),
          ),
      ),
    options: fillCurrent(currentEntries.map(({ options }) => options)).map(
      (value, index) => value + sayeProfit * Math.max(0, index - (startPredictionIndex - 1)),
    ),
  });
}

const getNetWorthMonthlyComposer = moize(
  <G extends OverviewGraphRequired<'income' | 'spending' | 'net' | 'stocks' | 'stockCostBasis'>>(
    today: Date,
    longTermOptions: LongTermOptions,
  ) =>
    createSelector(
      getLongTermRates(today),
      getGraphDates(today, longTermOptions),
      getStartPredictionIndex(today),
      getDerivedNetWorthEntries,
      getFundsRows,
      getSubcategories,
      getIlliquidEquity(today, longTermOptions),
      (
        longTermRates,
        dates,
        startPredictionIndex,
        netWorth,
        funds,
        subcategories,
        illiquidEquity,
      ): ((
        graph: G,
      ) => OverviewGraphRequired<
        'assets' | 'liabilities' | 'netWorth' | 'illiquidEquity' | AggregateKey,
        G
      >) =>
        compose(
          withNetWorth<G & Pick<OverviewGraphValues, AggregateKey | 'stocks' | 'income'>>(
            dates,
            startPredictionIndex,
            netWorth,
            funds,
            illiquidEquity,
            longTermOptions,
            longTermRates,
          ),
          withAggregateNetWorth(
            dates,
            startPredictionIndex,
            subcategories,
            netWorth,
            longTermOptions,
            longTermRates,
          ),
        ),
    ),
  { maxSize: 1 },
);

const getFundsMonthlyComposer = moize(
  <G extends OverviewGraphPartial>(
    today: Date,
    numOldMonths: number,
    longTermOptions: LongTermOptions,
  ): ((state: State) => (graph: G) => OverviewGraphRequired<'stocks' | 'stockCostBasis', G>) =>
    createSelector(
      getLongTermRates(today),
      getStartPredictionIndex(today),
      getGraphDates(today, longTermOptions),
      getMonthlyValues,
      getFundsRows,
      getFundsCachedValue.today(today),
      getAnnualisedFundReturns,
      withStocks(numOldMonths, longTermOptions),
    ),
  { maxSize: 1 },
);

export const getOverviewGraphValues = moize(
  (
    today: Date,
    numOldMonths: number,
    longTermOptions: LongTermOptions = longTermOptionsDisabled,
  ): ((state: State) => OverviewGraph) =>
    createSelector(
      getNetWorthMonthlyComposer(today, longTermOptions),
      getFundsMonthlyComposer<OverviewGraphRequired<'investmentPurchases'>>(
        today,
        numOldMonths,
        longTermOptions,
      ),
      getStartPredictionIndex(today),
      getGraphDates(today, longTermOptions),
      getMonthlyValues,
      (netWorthMonthlyComposer, fundsMonthlyComposer, startPredictionIndex, dates, monthly) => {
        const values: OverviewGraphValues = compose<
          Monthly,
          GQL<Monthly>,
          OverviewGraphRequired<'stockCostBasis'>,
          OverviewGraphRequired<'stockCostBasis' | 'spending' | 'net'>,
          OverviewGraphValues
        >(
          netWorthMonthlyComposer,
          withPredictedSpending(dates, today, longTermOptions),
          fundsMonthlyComposer,
          omitTypeName,
        )(monthly);

        return {
          dates: dates.map<Date>(({ date }) => date),
          values: roundedArrays(values),
          startPredictionIndex,
        };
      },
    ),
  { maxSize: 1 },
);

const isPositive = (value: number): boolean => value >= 0;
const isNegative = (value: number): boolean => value < 0;

const getFormattedMonths = (
  dates: Date[],
): Pick<OverviewTableRow, 'year' | 'month' | 'monthText'>[] =>
  dates.map((date) => ({
    year: getYear(date),
    month: getMonth(date) + 1,
    monthText: format(date, 'LLL-yy'),
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

const getCellColor = (ranges: Ranges, medians: Medians) => (
  value: number,
  key: keyof TableValues,
): string => getOverviewScoreColor(value, ranges[key], medians[key], overviewCategoryColor[key]);

const getCells = (graph: OverviewGraphValues, getColor: ReturnType<typeof getCellColor>) => (
  index: number,
): OverviewTableRow['cells'] =>
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
