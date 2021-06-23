import endOfDay from 'date-fns/endOfDay';
import getUnixTime from 'date-fns/getUnixTime';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import subDays from 'date-fns/subDays';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getDayGain, getDayGainAbs, getPaperValue, getRealisedValue, getBuyCost } from './gains';
import { getFundsRows, getFundsCache, PriceCache, PriceCacheRebased } from './helpers';
import { getTotalCost, getTotalUnits, lastInArray } from '~client/modules/data';
import { memoiseNowAndToday } from '~client/modules/time';
import { State } from '~client/reducers';
import { getAppConfig } from '~client/selectors/api';
import { getCashTotal } from '~client/selectors/overview/common';
import type {
  Data,
  Id,
  TransactionNative as Transaction,
  Portfolio,
  RowPrices,
  FundNative,
  TransactionNative,
  StockSplitNative,
  PortfolioItem,
} from '~client/types';
import { PageNonStandard } from '~client/types/enum';

export * from './gains';
export * from './graph';
export * from './helpers';
export * from './lines';

export const getHistoryOptions = createSelector(getAppConfig, (config) => config.historyOptions);

const getFundCacheAge = memoiseNowAndToday((time) =>
  createSelector(getFundsCache, (cache: PriceCache | undefined) => {
    if (!cache) {
      return null;
    }

    const { startTime, cacheTimes } = cache;

    const age = time.getTime() - 1000 * (cacheTimes[cacheTimes.length - 1] + startTime);
    return Number.isNaN(age) ? null : age;
  }),
);

export const filterPastTransactions = (today: Date, transactions: Transaction[]): Transaction[] =>
  transactions.filter(({ date }) => isBefore(startOfDay(date), today));

const getTransactionsToDateWithPrices = memoiseNowAndToday((time) =>
  createSelector(getFundsRows, getFundsCache, (rows, cache) => {
    const unixTime = getUnixTime(time);
    const priceIndexMax =
      cache.cacheTimes.length -
      cache.cacheTimes
        .slice()
        .reverse()
        .findIndex((compare) => compare <= unixTime - cache.startTime);

    return rows.map(({ id, item, transactions, stockSplits, allocationTarget }) => {
      const price =
        cache.prices[id]?.reduceRight<number>((last, { startIndex, values, rebasePriceRatio }) => {
          if (last) {
            return last;
          }
          const groupSlice = Math.max(0, priceIndexMax - startIndex);
          const splitRatio = lastInArray(rebasePriceRatio.slice(0, groupSlice)) ?? 1;
          const value = lastInArray(values.slice(0, groupSlice)) ?? 0;
          return value / splitRatio;
        }, 0) ?? 0;

      const transactionsToDate = filterPastTransactions(time, transactions);

      return { id, item, transactions: transactionsToDate, stockSplits, price, allocationTarget };
    });
  }),
);

function getAveragePriceSplitAdj(
  transactions: TransactionNative[],
  stockSplits: StockSplitNative[],
): [number, number] {
  const units = getTotalUnits(transactions, stockSplits);
  return [
    units,
    units ? transactions.reduce<number>((last, row) => last + row.price * row.units, 0) / units : 0,
  ];
}

function getPortfolioMetadata(
  transactions: TransactionNative[],
  stockSplits: StockSplitNative[],
  currentPrice: number,
  paperValue: number,
): PortfolioItem['metadata'] {
  const [unitsBought, buyPriceSplitAdj] = getAveragePriceSplitAdj(
    transactions.filter((row) => row.units > 0 && !row.drip),
    stockSplits,
  );
  const [unitsReinvested, reinvestmentPriceSplitAdj] = getAveragePriceSplitAdj(
    transactions.filter((row) => row.drip),
    stockSplits,
  );
  const [unitsSold, sellPriceSplitAdj] = getAveragePriceSplitAdj(
    transactions.filter((row) => row.units < 0),
    stockSplits,
  );

  const feesPaid = transactions.reduce<number>((last, row) => last + row.fees, 0);
  const taxesPaid = transactions.reduce<number>((last, row) => last + row.taxes, 0);

  const totalCostOfHolding = getBuyCost(transactions);
  const realisedValue = getRealisedValue(transactions);
  const pnl = paperValue + realisedValue - totalCostOfHolding;

  return {
    unitsBought,
    buyPriceSplitAdj,
    unitsSold: -unitsSold,
    sellPriceSplitAdj,
    unitsReinvested,
    reinvestmentPriceSplitAdj,
    feesPaid,
    taxesPaid,
    currentPrice,
    totalCostOfHolding,
    pnl,
  };
}

export const getPortfolio = moize(
  (date: Date) =>
    createSelector(
      getTransactionsToDateWithPrices.month(date),
      (funds): Portfolio =>
        funds
          .filter(({ price, transactions }) => price && transactions.length)
          .map(({ id, item, transactions, stockSplits, price, allocationTarget }) => {
            const value = getPaperValue(transactions, stockSplits, price);
            return {
              id,
              item,
              value,
              allocationTarget: allocationTarget ?? 0,
              metadata: getPortfolioMetadata(transactions, stockSplits, price, value),
            };
          }),
    ),
  { maxSize: 1 },
);

export const getStockValue = moize(
  (date: Date) =>
    createSelector(getPortfolio(date), (portfolio) =>
      portfolio.reduce<number>((last, { value }) => last + value, 0),
    ),
  { maxSize: 1 },
);

export const getFundsCostToDate = (date: Date, rows: FundNative[]): number =>
  rows.reduce(
    (sum, { transactions }) => sum + getTotalCost(filterPastTransactions(date, transactions)),
    0,
  );

export const getFundsCost = moize(
  (today: Date) => createSelector(getFundsRows, (rows) => getFundsCostToDate(today, rows)),
  { maxSize: 1 },
);

export const getInvestmentsBetweenDates = moize(
  (left: Date, right: Date) =>
    createSelector(
      getFundsRows,
      (investments) =>
        getFundsCostToDate(right, investments) - getFundsCostToDate(subDays(left, 1), investments),
    ),
  { maxSize: 1 },
);

const getInvestmentsSinceCashTotal = moize(
  (today: Date) =>
    createSelector(getCashTotal, getFundsRows, ({ date: cashTotalDate }, funds) =>
      cashTotalDate
        ? getFundsCostToDate(endOfDay(today), funds) -
          getFundsCostToDate(endOfDay(cashTotalDate), funds)
        : 0,
    ),
  { maxSize: 1 },
);

export const getCashBreakdown = moize(
  (today: Date) =>
    createSelector(getCashTotal, getInvestmentsSinceCashTotal(today), (cashTotal, investments) => ({
      cashInBank: Math.round(
        cashTotal.cashInBank +
          cashTotal.incomeSince -
          cashTotal.spendingSince -
          Math.max(0, investments - (cashTotal.stocksIncludingCash - cashTotal.stockValue)),
      ),
      cashToInvest: Math.round(
        Math.max(0, cashTotal.stocksIncludingCash - cashTotal.stockValue - investments),
      ),
      breakdown: {
        Ce: cashTotal.cashInBank, // "Cash (easy access)" at net worth date
        S: cashTotal.stocksIncludingCash, // "Stocks" at net worth date
        Vd: cashTotal.stockValue, // Actual stock value at net worth date
        I: investments, // Investments since net worth date
        P: cashTotal.spendingSince, // Purchase costs since net worth date
        N: cashTotal.incomeSince, // Income since net worth date
      },
    })),
  { maxSize: 1 },
);

export const getFundsCachedValue = memoiseNowAndToday((time, key) =>
  createSelector(
    getTransactionsToDateWithPrices[key](endOfDay(time)),
    getFundCacheAge[key](time),
    getDayGain,
    getDayGainAbs,
    (funds, ageMs, dayGain, dayGainAbs) => {
      const paperValue = funds.reduce<number>(
        (last, { transactions, stockSplits, price }) =>
          last + getPaperValue(transactions, stockSplits, price),
        0,
      );

      const realisedValue = funds.reduce<number>(
        (last, { transactions }) => last + getRealisedValue(transactions),
        0,
      );

      const cost = funds.reduce<number>(
        (last, { transactions }) => last + getBuyCost(transactions),
        0,
      );

      const gainAbs = paperValue + realisedValue - cost;
      const gain = cost ? gainAbs / cost : 0;

      return {
        value: paperValue,
        ageMs,
        gain,
        gainAbs,
        dayGain,
        dayGainAbs,
      };
    },
  ),
);

export function getPricesForRow(
  prices: PriceCacheRebased['prices'],
  id: Id,
  startTime: number,
  cacheTimes: number[],
): RowPrices {
  if (!prices[id]) {
    return null;
  }

  return prices[id].map<Data>(({ startIndex, values, rebasePriceRatio }) =>
    values.map((price, index) => [
      startTime + cacheTimes[index + startIndex],
      price / rebasePriceRatio[index],
    ]),
  );
}

export const getMaxAllocationTarget = moize((fundId: number) =>
  createSelector(getFundsRows, (rows): number =>
    Math.max(
      0,
      Math.min(
        100,
        rows
          .filter((fund) => fund.id !== fundId)
          .reduce<number>((last, fund) => last - (fund.allocationTarget ?? 0), 100),
      ),
    ),
  ),
);

export const getCashAllocationTarget = (state: State): number =>
  state[PageNonStandard.Funds].cashTarget;
