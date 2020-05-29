import humanizeDuration from 'humanize-duration';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getFundsRows, getCurrentFundsCache } from './helpers';
import { Period } from '~client/constants/graph';
import { getTotalUnits, getTotalCost } from '~client/modules/data';
import { State } from '~client/reducers';
import * as Funds from '~client/reducers/funds';
import { getDayGain, getDayGainAbs } from '~client/selectors/funds/gains';
import { Page, Data, Portfolio, CachedValue } from '~client/types';

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
    createSelector(getCurrentFundsCache, (cache: Funds.Cache | undefined) => {
      if (!cache) {
        return '';
      }

      const { startTime, cacheTimes } = cache;

      return getFundsCachedValueAgeText(startTime, cacheTimes, now);
    }),
  { maxSize: 1 },
);

export const getAllLatestValues = createSelector(
  getFundsRows,
  getCurrentFundsCache,
  (rows, cache) => {
    if (!(rows && cache)) {
      return [];
    }

    return rows.reduce<Portfolio>((last, { id, item, transactions }) => {
      const prices = cache.prices[id]?.values ?? [];
      return prices.length
        ? [...last, { id, item, value: prices[prices.length - 1] * getTotalUnits(transactions) }]
        : last;
    }, []);
  },
);

const getLatestTotalValue = createSelector(getAllLatestValues, (portfolio: Portfolio) =>
  portfolio.reduce<number>((last, { value }) => last + value, 0),
);

export const getFundsCachedValue = moize(
  (now: Date): ((state: State) => CachedValue) =>
    createSelector(
      [getLatestTotalValue, getFundCacheAge(now), getDayGain, getDayGainAbs],
      (value, ageText, dayGain, dayGainAbs) => ({ value, ageText, dayGain, dayGainAbs }),
    ),
  { maxSize: 1 },
);

export const getFundsCost = createSelector(getFundsRows, (rows) =>
  rows.reduce((sum, { transactions }) => sum + getTotalCost(transactions), 0),
);

type RowPrices = Data | null;

export function getPricesForRow(
  prices: Funds.Cache['prices'],
  id: string,
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
