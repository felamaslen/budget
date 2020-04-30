import { createSelector } from 'reselect';
import humanizeDuration from 'humanize-duration';
import { DateTime } from 'luxon';

import { Page } from '~client/types/app';
import { LegacyRow } from '~client/types/funds';
import { State } from '~client/reducers';
import * as Funds from '~client/reducers/funds';
import { Period } from '~client/constants/graph';
import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { getNow } from '~client/selectors/now';
import { getFundsRows, getCurrentFundsCache } from './helpers';
import {
  getRowGains,
  getGainsForRow,
  GainsForRow,
  getDayGain,
  getDayGainAbs,
} from '~client/selectors/funds/gains';

export const getPeriod = (state: Pick<State, Page.funds>): Period => state.funds.period;

export function getFundsCachedValueAgeText(
  startTime: number,
  cacheTimes: number[],
  now: DateTime,
): string {
  const age = now.toSeconds() * 1000 - 1000 * (cacheTimes[cacheTimes.length - 1] + startTime);

  if (Number.isNaN(age)) {
    return 'no values';
  }
  if (age < 0) {
    return 'in the future!';
  }

  return `${humanizeDuration(age, { round: true, largest: 1 })} ago`;
}

const getFundCacheAge = createSelector(
  getNow,
  getCurrentFundsCache,
  (now: DateTime, cache: Funds.Cache | undefined) => {
    if (!cache) {
      return '';
    }

    const { startTime, cacheTimes } = cache;

    return getFundsCachedValueAgeText(startTime, cacheTimes, now);
  },
);

const getLastFundsValue = createSelector([getFundsRows, getCurrentFundsCache], (rows, cache) => {
  if (!(rows && cache)) {
    return 0;
  }

  return rows.reduce((sum, { id, transactions }) => {
    const { values: prices } = cache.prices[id] || {};
    if (!(prices && prices.length)) {
      return sum;
    }

    return sum + prices[prices.length - 1] * getTotalUnits(transactions || []);
  }, 0);
});

export const getFundsCachedValue = createSelector(
  [getLastFundsValue, getFundCacheAge, getDayGain, getDayGainAbs],
  (value, ageText, dayGain, dayGainAbs) => ({ value, ageText, dayGain, dayGainAbs }),
);

export const getFundsCost = createSelector(getFundsRows, rows => {
  if (!rows) {
    return 0;
  }

  return rows.reduce((sum, { transactions }) => {
    if (isSold(transactions || [])) {
      return sum;
    }

    return sum + getTotalCost(transactions || []);
  }, 0);
});

type RowPrices = [number, number][] | null;

function getPricesForRow(
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

export type ProcessedFundsRow = LegacyRow & {
  gain: GainsForRow;
  prices: RowPrices;
  sold: boolean;
  small: boolean;
};

export const getProcessedFundsRows = createSelector(
  [getFundsRows, getCurrentFundsCache],
  (rows, cache): ProcessedFundsRow[] => {
    if (!(rows && cache)) {
      return [];
    }

    const { startTime, cacheTimes, prices } = cache;

    const rowGains = getRowGains(rows, cache);

    return rows.map(row => {
      const sold = isSold(row.transactions || []);

      return {
        ...row,
        gain: getGainsForRow(rowGains, row.id),
        prices: getPricesForRow(prices, row.id, startTime, cacheTimes),
        sold,
        small: sold,
      };
    });
  },
);
