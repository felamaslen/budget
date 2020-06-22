import endOfDay from 'date-fns/endOfDay';
import isBefore from 'date-fns/isBefore';
import startOfDay from 'date-fns/startOfDay';
import humanizeDuration from 'humanize-duration';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getFundsRows, getCurrentFundsCache } from './helpers';
import { Period } from '~client/constants/graph';
import { getTotalUnits, getTotalCost } from '~client/modules/data';
import { State } from '~client/reducers';
import { Cache } from '~client/reducers/funds';
import { getDayGain, getDayGainAbs } from '~client/selectors/funds/gains';
import { Id, Page, Data, Portfolio, CachedValue, Transaction } from '~client/types';

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

export const getPortfolio = moize(
  (today: Date) =>
    createSelector(getFundsRows, getCurrentFundsCache, (rows, cache) => {
      if (!(rows && cache)) {
        return [];
      }

      return rows.reduce<Portfolio>((last, { id, item, transactions }) => {
        const prices = cache.prices[id]?.values ?? [];
        const transactionsToToday = filterPastTransactions(today, transactions);

        return prices.length && transactionsToToday.length
          ? [
              ...last,
              {
                id,
                item,
                value: prices[prices.length - 1] * getTotalUnits(transactionsToToday),
              },
            ]
          : last;
      }, []);
    }),
  { maxSize: 1 },
);

const getLatestTotalValue = moize(
  (today: Date) =>
    createSelector(getPortfolio(today), (portfolio: Portfolio) =>
      portfolio.reduce<number>((last, { value }) => last + value, 0),
    ),
  { maxSize: 1 },
);

export const getFundsCachedValue = moize(
  (now: Date): ((state: State) => CachedValue) =>
    createSelector(
      getLatestTotalValue(endOfDay(now)),
      getFundCacheAge(now),
      getDayGain,
      getDayGainAbs,
      (value, ageText, dayGain, dayGainAbs) => ({ value, ageText, dayGain, dayGainAbs }),
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
