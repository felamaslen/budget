import endOfDay from 'date-fns/endOfDay';
import getUnixTime from 'date-fns/getUnixTime';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import humanizeDuration from 'humanize-duration';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getLatestNetWorthAggregate } from '../overview/net-worth';
import { getDayGain, getDayGainAbs, getPaperValue, getRealisedValue, getBuyCost } from './gains';
import { getFundsRows, getCurrentFundsCache } from './helpers';
import { Period } from '~client/constants/graph';
import { getTotalCost } from '~client/modules/data';
import { State } from '~client/reducers';
import { Cache, getRemainingAllocation } from '~client/reducers/funds';
import { Id, Page, Data, Portfolio, CachedValue, Transaction, Aggregate } from '~client/types';

export * from './gains';
export * from './graph';
export * from './helpers';
export * from './lines';
export * from './stocks';

export const getPeriod = (state: Pick<State, Page.funds>): Period => state.funds.period;

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

const getFundCacheAge = moize(
  (now: Date): ((state: State) => string) =>
    createSelector(getCurrentFundsCache, (cache: Cache | undefined) => {
      if (!cache) {
        return '';
      }

      const { startTime, cacheTimes } = cache;

      return getFundsCachedValueAgeText(startTime, cacheTimes, now);
    }),
  { maxSize: 1 },
);

const filterPastTransactions = (today: Date, transactions: Transaction[]): Transaction[] =>
  transactions.filter(({ date }) => isBefore(startOfDay(date), today));

const getTransactionsToDateWithPrices = moize(
  (date: Date) =>
    createSelector(getFundsRows, getCurrentFundsCache, (rows, cache) => {
      if (!(rows && cache)) {
        return [];
      }

      const unixTime = getUnixTime(date);
      const priceIndexMax =
        cache.cacheTimes.length -
        cache.cacheTimes
          .slice()
          .reverse()
          .findIndex((time) => time <= unixTime - cache.startTime);

      return rows.map(({ id, item, transactions, allocationTarget }) => {
        const prices = cache.prices[id]?.values ?? [];
        const priceIndex = Math.min(prices.length, priceIndexMax - cache.prices[id]?.startIndex);
        const price = prices[priceIndex - 1] ?? 0;
        const transactionsToDate = filterPastTransactions(date, transactions);

        return { id, item, transactions: transactionsToDate, price, allocationTarget };
      });
    }),
  { maxSize: 1 },
);

export const getPortfolio = moize(
  (date: Date) =>
    createSelector(
      getTransactionsToDateWithPrices(date),
      (funds): Portfolio =>
        funds
          .filter(({ price, transactions }) => price && transactions.length)
          .map(({ id, item, transactions, price, allocationTarget }) => ({
            id,
            item,
            value: getPaperValue(transactions, price),
            allocationTarget,
          })),
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

export const getCashInBank = createSelector(
  getLatestNetWorthAggregate,
  (netWorth): number => netWorth?.[Aggregate.cashEasyAccess] ?? 0,
);

export const getCashToInvest = moize(
  (today: Date) =>
    createSelector(
      getLatestNetWorthAggregate,
      getCashInBank,
      getStockValue(startOfMonth(today)),
      (netWorth, cashInBank, stockValue): number => {
        const stocksIncludingCash = netWorth?.[Aggregate.stocks] ?? 0;
        return cashInBank + stocksIncludingCash - stockValue;
      },
    ),
  { maxSize: 1 },
);

export const getFundsCachedValue = moize(
  (now: Date): ((state: State) => CachedValue) =>
    createSelector(
      getTransactionsToDateWithPrices(endOfDay(now)),
      getFundCacheAge(now),
      getDayGain,
      getDayGainAbs,
      (funds, ageText, dayGain, dayGainAbs) => {
        const paperValue = funds.reduce<number>(
          (last, { transactions, price }) => last + getPaperValue(transactions, price),
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
  { maxSize: 1 },
);

export const getFundsCost = moize(
  (today: Date) =>
    createSelector(getFundsRows, (rows) =>
      rows.reduce(
        (sum, { transactions }) => sum + getTotalCost(filterPastTransactions(today, transactions)),
        0,
      ),
    ),
  { maxSize: 1 },
);

type RowPrices = Data | null;

export function getPricesForRow(
  prices: Cache['prices'],
  id: Id,
  startTime: number,
  cacheTimes: number[],
): RowPrices {
  if (!prices[id]) {
    return null;
  }

  return prices[id].values.map((price, index) => [
    startTime + cacheTimes[index + prices[id].startIndex],
    price,
  ]);
}

export const getMaxAllocationTarget = moize((fundId: number) => (state: State): number =>
  Math.max(0, Math.min(1, getRemainingAllocation(state[Page.funds], fundId))),
);

export const getCashAllocationTarget = (state: State): number => state[Page.funds].cashTarget;
