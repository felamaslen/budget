import { createSelector } from 'reselect';
import memoize from 'memoize-one';
import { isSold, getTotalUnits, getTotalCost } from '~client/modules/data';
import { Color, COLOR_FUND_UP, COLOR_FUND_DOWN } from '~client/constants/colors';
import { getCurrentFundsCache, getFundsRows } from '~client/selectors/funds/helpers';
import { PickRequire } from '~client/types';
import { Row, Transaction } from '~client/types/funds';
import * as Funds from '~client/reducers/funds';

const scoreColor = (score: number, channel: number): number =>
  Math.round(255 + score * (channel - 255));

function getFundColor(value: number, min: number, max: number): [number, number, number] {
  const color = value > 0 ? COLOR_FUND_UP : COLOR_FUND_DOWN;

  const range = value > 0 ? max : min;

  if (value === 0 || Math.abs(range) === 0) {
    return [255, 255, 255];
  }

  const score = value / range;

  return [scoreColor(score, color[0]), scoreColor(score, color[1]), scoreColor(score, color[2])];
}

const roundGain = (value: number): number => Math.round(10000 * value) / 10000;
const roundAbs = (value: number): number => Math.round(value);

type CostValue = {
  cost: number;
  value: number;
  dayGain?: number;
  dayGainAbs?: number;
};

function getCostValue(
  transactions: Transaction[],
  price: number,
  yesterdayPrice: number,
): CostValue {
  if (isSold(transactions) || !price) {
    return transactions.reduce(
      ({ cost, value }, item) => ({
        cost: cost + Math.max(0, item.cost),
        value: value - Math.min(0, item.cost),
      }),
      { cost: 0, value: 0 },
    );
  }

  const units = getTotalUnits(transactions);
  const cost = getTotalCost(transactions);
  const value = price * units;

  let dayGainAbs = 0;
  let dayGain = 0;

  if (yesterdayPrice) {
    dayGainAbs = roundAbs((price - yesterdayPrice) * units);
    dayGain = roundGain((price - yesterdayPrice) / yesterdayPrice);
  }

  return {
    cost,
    value,
    dayGain,
    dayGainAbs,
  };
}

type RowGain = Partial<
  CostValue & {
    gain: number;
    gainAbs: number;
  }
>;

export function getRowGains(
  rows: Row[],
  cache: Funds.Cache,
): {
  [id: string]: RowGain;
} {
  return rows.reduce((items, { id, transactions }) => {
    if (!transactions) {
      return { ...items, [id]: { value: 0, gain: 0, gainAbs: 0 } };
    }

    const rowCache = cache.prices[id] || { values: [] };

    const price = rowCache.values.length ? rowCache.values[rowCache.values.length - 1] : 0;

    const yesterdayPrice =
      rowCache.values.length > 1 ? rowCache.values[rowCache.values.length - 2] : 0;

    const { cost, ...props } = getCostValue(transactions, price, yesterdayPrice);

    const gainAbs = roundAbs(props.value - cost);
    const gain = roundGain((props.value - cost) / cost);

    return { ...items, [id]: { ...props, gain, gainAbs } };
  }, {});
}

const rowGainHasGain = (rowGain: RowGain): rowGain is PickRequire<RowGain, 'gain'> =>
  Reflect.has(rowGain, 'gain');

const getMinMax = memoize((rowGains: { [fundId: string]: RowGain }): [number, number] =>
  Object.keys(rowGains)
    .map(id => rowGains[id])
    .filter(rowGainHasGain)
    .reduce(([min, max], rowGain) => [Math.min(min, rowGain.gain), Math.max(max, rowGain.gain)], [
      Infinity,
      -Infinity,
    ]),
);

export type GainsForRow =
  | (RowGain & {
      color: Color;
    })
  | null;

export function getGainsForRow(rowGains: { [fundId: string]: RowGain }, id: string): GainsForRow {
  if (!(rowGains[id] && rowGainHasGain(rowGains[id]))) {
    return null;
  }

  const [min, max] = getMinMax(rowGains);

  return { ...rowGains[id], color: getFundColor(rowGains[id].gain ?? 0, min, max) };
}

const getItemsWithPrices = createSelector(getCurrentFundsCache, getFundsRows, (cache, items) => {
  if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1 && items && items.length)) {
    return [];
  }

  return items.filter(({ id, transactions }) => cache.prices[id] && transactions);
});

const getLatestTimes = createSelector(getCurrentFundsCache, cache => {
  if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1)) {
    return { timeLatest: new Date(), timePrev: new Date() };
  }

  const { cacheTimes, startTime } = cache;

  const timeLatest = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 1]));
  const timePrev = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 2]));

  return { timeLatest, timePrev };
});

const getLatestValues = createSelector(
  getItemsWithPrices,
  getLatestTimes,
  getCurrentFundsCache,
  (itemsWithPrices, { timeLatest, timePrev }, cache) => {
    const getValue = (maxDate: Date): number => {
      const maxDateValue = maxDate.getTime() / 1000;

      return itemsWithPrices.reduce((last, { id, transactions }) => {
        const { startIndex = 0, values = [] } = cache?.prices[id] || {};
        const timeIndex =
          (cache?.cacheTimes || []).length -
          1 -
          (cache?.cacheTimes || [])
            .slice()
            .reverse()
            .findIndex(value => value + (cache?.startTime || 0) <= maxDateValue);

        if (timeIndex >= startIndex + values.length) {
          return last;
        }

        const price = values[timeIndex - startIndex];

        const units = (transactions || [])
          .filter(({ date }) => Number(date) <= Number(maxDate))
          .reduce((sum, { units: value }) => sum + value, 0);

        return last + price * units;
      }, 0);
    };

    return { latest: getValue(timeLatest), prev: getValue(timePrev) };
  },
);

export const getDayGainAbs = createSelector(getLatestValues, ({ latest, prev }) => latest - prev);

export const getDayGain = createSelector(
  getItemsWithPrices,
  getLatestTimes,
  getLatestValues,
  (itemsWithPrices, { timeLatest, timePrev }, { latest, prev }) => {
    if (!(latest && prev)) {
      return 0;
    }

    const getCost = (maxDate: Date): number =>
      itemsWithPrices.reduce(
        (last, { transactions }) =>
          (transactions || [])
            .filter(({ date }) => Number(date) <= Number(maxDate))
            .reduce((sum, { cost }) => sum + cost, last),
        0,
      );

    const costLatest = getCost(timeLatest);
    const costPrev = getCost(timePrev);

    const gainLatest = (latest - costLatest) / costLatest;
    const gainPrev = (prev - costPrev) / costPrev;

    const dayGain = (1 + gainLatest) / (1 + gainPrev) - 1;

    return dayGain;
  },
);
