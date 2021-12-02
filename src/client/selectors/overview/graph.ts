import { compose } from '@typed/compose';
import addMonths from 'date-fns/addMonths';
import endOfMonth from 'date-fns/endOfMonth';
import getDate from 'date-fns/getDate';
import getDaysInMonth from 'date-fns/getDaysInMonth';
import isSameMonth from 'date-fns/isSameMonth';
import moize from 'moize';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { getGraphDates, getStartPredictionIndex } from './common';
import {
  getAnnualisedFundReturns,
  getFutureIncome,
  getMonthlyValues,
  getStockValues,
  getSubcategories,
} from './direct';
import {
  calculatePredictedSAYEMonthlyDeposit,
  EntryWithFTI,
  getDerivedNetWorthEntries,
  getIlliquidEquity,
  IlliquidEquity,
  sumComplexValue,
} from './net-worth';
import { longTermOptionsDisabled, reduceDates, roundedArrays, withSpendingColumn } from './utils';

import { GRAPH_CASHFLOW_LONG_TERM_PREDICTION_YEARS } from '~client/constants';
import { getTotalCost, rightPad } from '~client/modules/data';
import { forecastCompoundedReturns } from '~client/modules/finance';
import { State } from '~client/reducers';
import {
  filterPastTransactions,
  getFundsCostToDate,
  getFundsValueTodayWithoutPension,
} from '~client/selectors/funds';
import { getFundsRows } from '~client/selectors/funds/helpers';
import {
  FundNative as Fund,
  LongTermOptions,
  LongTermRates,
  OverviewGraph,
  OverviewGraphDate,
  OverviewGraphPartial,
  OverviewGraphRequired,
  OverviewGraphValues,
} from '~client/types';
import { PageListStandard } from '~client/types/enum';
import type { Monthly, NetWorthSubcategory } from '~client/types/gql';
import { NetWorthAggregate } from '~shared/constants';
import type { GQL } from '~shared/types';
import { arrayAverage, Average, omitTypeName } from '~shared/utils';

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
        stockPurchase:
          arrayAverage(monthly.investmentPurchases.slice(0, startPredictionIndex)) || 0,
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

type NetWorthContext = {
  dates: OverviewGraphDate[];
  startPredictionIndex: number;
  subcategories: NetWorthSubcategory[];
  netWorth: EntryWithFTI[];
  funds: Fund[];
  illiquidEquity: IlliquidEquity[];
  longTermOptions: LongTermOptions;
  longTermRates: LongTermRates;
};

type GraphForNetWorth = Partial<OverviewGraphValues> &
  Pick<OverviewGraphValues, 'income' | 'spending' | 'stocks'>;

type NetWorthKey =
  | 'cashLiquid'
  | 'cashOther'
  | 'illiquidEquity'
  | 'pension'
  | 'options'
  | 'investments'
  | 'assets'
  | 'liabilities'
  | 'netWorth';

type GraphWithNetWorth<G extends GraphForNetWorth> = G & Pick<OverviewGraphValues, NetWorthKey>;

function predictLiquidCash<G extends GraphForNetWorth>(ctx: NetWorthContext, graph: G): number[] {
  const monthlyStockPurchase = getMonthlyStockPurchase(ctx.longTermOptions, ctx.longTermRates);

  return ctx.dates.reduce<{
    liquidCash: number[];
    creditCardDebt: number;
  }>(
    (reduction, { date, monthIndex }, index) => {
      if (index < ctx.startPredictionIndex) {
        const creditCardDebt = ctx.netWorth[index].values
          .filter(
            (value) => ctx.subcategories.find(({ id }) => id === value.subcategory)?.hasCreditLimit,
          )
          .reduce<number>(
            (sum, value) =>
              sum + sumComplexValue(value, ctx.netWorth[index].currencies, ctx.subcategories),
            0,
          );

        return {
          creditCardDebt,
          liquidCash: [
            ...reduction.liquidCash,
            ctx.netWorth[index].aggregate[NetWorthAggregate.cashEasyAccess] + creditCardDebt,
          ],
        };
      }

      const fundCostsPredicted =
        monthlyStockPurchase * (monthIndex - ctx.dates[index - 1].monthIndex);
      const fundCostsActual =
        getFundsCostToDate(date, ctx.funds) -
        (index > 0 ? getFundsCostToDate(ctx.dates[index - 1].date, ctx.funds) : 0);

      const spending = graph.spending[index] + fundCostsPredicted + fundCostsActual;
      const income = graph.income[index];

      const netChange = income - spending;

      return {
        creditCardDebt: reduction.creditCardDebt,
        liquidCash: [
          ...reduction.liquidCash,
          Math.max(0, reduction.liquidCash[reduction.liquidCash.length - 1] + netChange),
        ],
      };
    },
    { liquidCash: [], creditCardDebt: 0 },
  ).liquidCash;
}

function predictOtherCash(
  ctx: NetWorthContext,
  sayeDeposit: number,
  stocks: number[],
  investments: number[],
): number[] {
  return ctx.dates
    .reduce<number[]>((last, { monthIndex }, index) => {
      if (index < ctx.startPredictionIndex) {
        return [...last, ctx.netWorth[index].aggregate[NetWorthAggregate.cashOther]];
      }

      const sayeChange = sayeDeposit * (monthIndex - ctx.dates[index - 1].monthIndex);

      return [...last, last[last.length - 1] + sayeChange];
    }, [])
    .map((value, index) => {
      const investmentDiff = Math.max(0, investments[index] - stocks[index]);
      return value + investmentDiff;
    });
}

function predictInvestments(ctx: NetWorthContext, stocks: number[]): number[] {
  return ctx.dates.reduce<number[]>((last, _, index) => {
    if (index < ctx.startPredictionIndex) {
      return [...last, ctx.netWorth[index].aggregate[NetWorthAggregate.stocks]];
    }

    const stockReturn = stocks[index] - stocks[index - 1];

    return [...last, last[last.length - 1] + stockReturn];
  }, []);
}

function predictOptions(ctx: NetWorthContext, sayeProfit: number): number[] {
  return ctx.dates.reduce<number[]>((last, { monthIndex }, index) => {
    if (index < ctx.startPredictionIndex) {
      return [...last, ctx.netWorth[index].options];
    }

    const netChange = sayeProfit * (monthIndex - ctx.dates[index - 1].monthIndex);

    return [...last, last[last.length - 1] + netChange];
  }, []);
}

function predictAssets<G extends GraphForNetWorth>(
  ctx: NetWorthContext,
  graph: G,
  cashLiquid: number[],
  cashOther: number[],
): number[] {
  return ctx.dates
    .reduce<number[]>((last, _, index) => {
      if (index < ctx.startPredictionIndex) {
        return [...last, ctx.netWorth[index].assets];
      }

      const stockReturn = graph.stocks[index] - graph.stocks[index - 1];

      const illiquidChange = ctx.illiquidEquity[index].value - ctx.illiquidEquity[index - 1].value;
      const liquidCashChange = cashLiquid[index] - cashLiquid[index - 1];
      const otherCashChange = cashOther[index] - cashOther[index - 1];

      const netChange = stockReturn + illiquidChange + liquidCashChange + otherCashChange;

      return [...last, last[last.length - 1] + netChange];
    }, [])
    .map(Math.round);
}

function predictLiabilities(ctx: NetWorthContext): number[] {
  return ctx.dates
    .reduce<number[]>((last, _, index) => {
      if (index < ctx.startPredictionIndex) {
        return [...last, -ctx.netWorth[index].liabilities];
      }
      const loanDebtChange = ctx.illiquidEquity[index].debt - ctx.illiquidEquity[index - 1].debt;
      return [...last, last[last.length - 1] + loanDebtChange];
    }, [])
    .map(Math.round);
}

const withNetWorth =
  <G extends GraphForNetWorth>(ctx: NetWorthContext) =>
  (graph: G): GraphWithNetWorth<G> => {
    const currentEntries = ctx.netWorth.slice(0, ctx.startPredictionIndex);
    const fillCurrent = (values: number[]): number[] => rightPad(values, ctx.dates.length);
    const fillAggregate = (key: NetWorthAggregate): number[] =>
      fillCurrent(currentEntries.map(({ aggregate }) => aggregate[key]));

    const { deposit: sayeDeposit, profit: sayeProfit } = calculatePredictedSAYEMonthlyDeposit(
      ctx.subcategories,
      ctx.netWorth,
      ctx.startPredictionIndex,
    );

    const options = predictOptions(ctx, sayeProfit);
    const investments = predictInvestments(ctx, graph.stocks);

    const cashLiquid = predictLiquidCash(ctx, graph);
    const cashOther = predictOtherCash(ctx, sayeDeposit, graph.stocks, investments);

    const assets = predictAssets(ctx, graph, cashLiquid, cashOther);
    const liabilities = predictLiabilities(ctx);

    return {
      ...graph,
      cashLiquid,
      cashOther,
      illiquidEquity: ctx.illiquidEquity.map(({ value, debt }) => value + debt),
      pension: fillAggregate(NetWorthAggregate.pension),
      options,
      investments,
      assets,
      liabilities,
      netWorth: assets.map((value, index) => value + liabilities[index]),
    };
  };

function predictByPastAverages(
  dates: OverviewGraphDate[],
  currentIndex: number,
  currentMonthRatio: number,
  category: Category,
  presentValues: number[],
  averageMode: Average = Average.Median,
): number[] {
  if (currentIndex === -1) {
    return presentValues;
  }

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
  dates: OverviewGraphDate[],
  currentIndex: number,
  startPredictionIndex: number,
  currentIncome: number[],
  futureIncome: number[],
  longTermOptions: LongTermOptions,
): number[] {
  if (!longTermOptions.enabled || typeof longTermOptions.rates.income === 'undefined') {
    return reduceDates(
      dates.slice(startPredictionIndex),
      (last, _, __, index) => [
        ...last,
        futureIncome[index + startPredictionIndex - currentIndex] ?? 0,
      ],
      dates[startPredictionIndex],
      currentIncome.slice(0, startPredictionIndex),
    );
  }

  return reduceDates(
    dates.slice(startPredictionIndex),
    (last, nextDate, prevDate, index) => [
      ...last,
      index === 0 && startPredictionIndex === currentIndex
        ? futureIncome[0]
        : (longTermOptions.rates.income as number) * (nextDate.monthIndex - prevDate.monthIndex),
    ],
    dates[currentIndex],
    currentIncome.slice(0, startPredictionIndex),
  );
}

function calculateFutures<G extends OverviewGraphPartial>(
  dates: OverviewGraphDate[],
  today: Date,
  startPredictionIndex: number,
  futureIncome: number[],
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
        income: predictIncome(
          dates,
          currentIndex,
          startPredictionIndex,
          graph.income,
          futureIncome,
          longTermOptions,
        ),
        bills: longTermOptions.enabled
          ? predictByPastAverages(dates, currentIndex, currentMonthRatio, 'bills', graph.bills)
          : graph.bills,
        investmentPurchases: rightPad(graph.investmentPurchases, dates.length, 0),
      },
    );
}

const withNetChange =
  <G extends OverviewGraphRequired<'spending'>>() =>
  (graph: G): OverviewGraphRequired<'net', G> => ({
    ...graph,
    net: graph.income.map((value, index) => value - graph.spending[index]),
  });

const withPredictedSpending = <G extends OverviewGraphPartial>(
  dates: OverviewGraphDate[],
  today: Date,
  startPredictionIndex: number,
  futureIncome: number[],
  longTermOptions: LongTermOptions,
): ((graph: G) => OverviewGraphRequired<'spending' | 'net', G>) =>
  compose<G, G, OverviewGraphRequired<'spending', G>, OverviewGraphRequired<'spending' | 'net', G>>(
    withNetChange(),
    withSpendingColumn(dates.length),
    calculateFutures(dates, today, startPredictionIndex, futureIncome, longTermOptions),
  );

const predictStockReturns =
  (dates: OverviewGraphDate[], annualisedFundReturns: number, monthlyStockPurchase: number) =>
  (stocks: number[]): number[] =>
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

const withCurrentStockValue =
  (currentStockValue: number) =>
  (stocks: number[]): number[] =>
    replaceAtIndex(stocks, stocks.length - 1, currentStockValue);

const getStockCostBasis = (
  dates: OverviewGraphDate[],
  monthlyStockPurchase: number,
  numOldMonths: number,
  startPredictionIndex: number,
  funds: Fund[],
): number[] =>
  Array(numOldMonths)
    .fill(0)
    .map<OverviewGraphDate>((_, index) => ({
      date: endOfMonth(addMonths(dates[0].date, index - numOldMonths)),
      monthIndex: index - numOldMonths,
    }))
    .concat(dates)
    .map<number>(({ date, monthIndex }) =>
      funds.reduce<number>(
        (last, fund) =>
          last +
          getTotalCost(
            filterPastTransactions(
              date,
              fund.transactions.filter((transaction) => !transaction.drip && !transaction.pension),
            ),
          ),
        monthlyStockPurchase * Math.max(0, monthIndex - startPredictionIndex + 1),
      ),
    );

const withStocks =
  <G extends OverviewGraphPartial>(numOldMonths: number, longTermOptions: LongTermOptions) =>
  (
    longTermRates: LongTermRates,
    startPredictionIndex: number,
    dates: OverviewGraphDate[],
    stocks: number[],
    funds: Fund[],
    currentStockValue: number,
    annualisedFundReturns: number,
  ) =>
  (graph: G): OverviewGraphRequired<'stocks' | 'stockCostBasis', G> => {
    const monthlyStockPurchase = getMonthlyStockPurchase(longTermOptions, longTermRates);

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
      )(stocks),
      stockCostBasis: getStockCostBasis(
        dates,
        monthlyStockPurchase,
        numOldMonths,
        startPredictionIndex,
        funds,
      ),
    };
  };

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
      ): ((graph: G) => OverviewGraphRequired<NetWorthKey, G>) =>
        withNetWorth<G>({
          dates,
          startPredictionIndex,
          subcategories,
          netWorth,
          funds,
          illiquidEquity,
          longTermOptions,
          longTermRates,
        }),
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
      getStockValues,
      getFundsRows,
      getFundsValueTodayWithoutPension(today),
      getAnnualisedFundReturns,
      withStocks(numOldMonths, longTermOptions),
    ),
  { maxSize: 1 },
);

export const getOverviewGraphValues = moize(
  (
    today: Date,
    numOldMonths = 0,
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
      getFutureIncome,
      getMonthlyValues,
      (
        netWorthMonthlyComposer,
        fundsMonthlyComposer,
        startPredictionIndex,
        dates,
        futureIncome,
        monthly,
      ) => {
        const values: OverviewGraphValues = compose<
          Monthly,
          GQL<Monthly>,
          OverviewGraphRequired<'stocks' | 'stockCostBasis'>,
          OverviewGraphRequired<'stocks' | 'stockCostBasis' | 'spending' | 'net'>,
          OverviewGraphValues
        >(
          netWorthMonthlyComposer,
          withPredictedSpending(dates, today, startPredictionIndex, futureIncome, longTermOptions),
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
