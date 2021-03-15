import addDays from 'date-fns/addDays';
import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import getUnixTime from 'date-fns/getUnixTime';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import subDays from 'date-fns/subDays';
import subMonths from 'date-fns/subMonths';
import humanizeDuration from 'humanize-duration';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getLatestNetWorthAggregate } from '../overview/net-worth';
import { getDayGain, getDayGainAbs, getPaperValue, getRealisedValue, getBuyCost } from './gains';
import { getFundsRows, getFundsCache, PriceCache, PriceCacheRebased } from './helpers';
import { getTotalCost, lastInArray } from '~client/modules/data';
import { memoiseNowAndToday } from '~client/modules/time';
import { State } from '~client/reducers';
import { getAppConfig } from '~client/selectors/api';
import { getCostForMonthSoFar } from '~client/selectors/overview/common';
import type {
  Data,
  Id,
  TransactionNative as Transaction,
  Portfolio,
  RowPrices,
  FundNative,
} from '~client/types';
import { Aggregate, PageNonStandard } from '~client/types/enum';

export * from './gains';
export * from './graph';
export * from './helpers';
export * from './lines';

export const getHistoryOptions = createSelector(getAppConfig, (config) => config.historyOptions);

export function getFundsCachedValueAgeText(
  startTime: number,
  cacheTimes: number[],
  now: Date,
): string {
  const age = now.getTime() - 1000 * (cacheTimes[cacheTimes.length - 1] + startTime);

  if (Number.isNaN(age)) {
    return 'no values';
  }
  if (age < 0) {
    return 'in the future!';
  }

  return `${humanizeDuration(age, { round: true, largest: 1 })} ago`;
}

const getFundCacheAge = memoiseNowAndToday((time) =>
  createSelector(getFundsCache, (cache: PriceCache | undefined) => {
    if (!cache) {
      return '';
    }

    const { startTime, cacheTimes } = cache;

    return getFundsCachedValueAgeText(startTime, cacheTimes, time);
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

export const getPortfolio = moize((date: Date) =>
  createSelector(
    getTransactionsToDateWithPrices.month(date),
    (funds): Portfolio =>
      funds
        .filter(({ price, transactions }) => price && transactions.length)
        .map(({ id, item, transactions, stockSplits, price, allocationTarget }) => ({
          id,
          item,
          value: getPaperValue(transactions, stockSplits, price),
          allocationTarget: allocationTarget ?? 0,
        })),
  ),
);

export const getStockValue = moize(
  (date: Date) =>
    createSelector(getPortfolio(date), (portfolio) =>
      portfolio.reduce<number>((last, { value }) => last + value, 0),
    ),
  { maxSize: 1 },
);

const getFundsCostToDate = (date: Date, rows: FundNative[]): number =>
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

export const getCashInBank = moize(
  (today: Date) =>
    createSelector(
      getLatestNetWorthAggregate(subMonths(endOfMonth(today), 1)),
      getFundsCost(startOfDay(addDays(today, 1))),
      getFundsCost(startOfMonth(today)),
      getCostForMonthSoFar(today),
      (netWorth, fundsCostToday, fundsCostPreviousMonth, purchaseCostSoFar): number => {
        const cashTotalAtStartOfMonth = netWorth?.[Aggregate.cashEasyAccess] ?? 0;
        const fundsCost = fundsCostToday - fundsCostPreviousMonth;
        return Math.max(0, cashTotalAtStartOfMonth - fundsCost - purchaseCostSoFar);
      },
    ),
  { maxSize: 1 },
);

export const getCashToInvest = moize(
  (today: Date) =>
    createSelector(
      getLatestNetWorthAggregate(today),
      getCashInBank(today),
      getStockValue(startOfMonth(today)),
      (netWorth, cashInBank, stockValue): number => {
        const stocksIncludingCash = netWorth?.[Aggregate.stocks] ?? 0;
        return Math.max(0, cashInBank + stocksIncludingCash - stockValue);
      },
    ),
  { maxSize: 1 },
);

export const getFundsCachedValue = memoiseNowAndToday((time, key) =>
  createSelector(
    getTransactionsToDateWithPrices[key](endOfDay(time)),
    getFundCacheAge[key](time),
    getDayGain,
    getDayGainAbs,
    (funds, ageText, dayGain, dayGainAbs) => {
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
        ageText,
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
