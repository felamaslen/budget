import getUnixTime from 'date-fns/getUnixTime';
import moize from 'moize';
import { rgb, parseToRgb } from 'polished';
import { createSelector } from 'reselect';

import { getCurrentFundsCache, getFundsRows } from './helpers';
import { isSold, getTotalUnits } from '~client/modules/data';
import { Cache } from '~client/reducers/funds';
import { colors } from '~client/styled/variables';
import { Id, Fund, Transaction } from '~client/types';

const scoreColor = (score: number, channel: number): number =>
  Math.round(255 + score * (channel - 255));

function getFundColor(value: number, min: number, max: number): string {
  const color = value > 0 ? colors.funds.fundUp : colors.funds.fundDown;
  const range = value > 0 ? max : min;

  if (value === 0 || Math.abs(range) === 0) {
    return colors.white;
  }

  const score = value / range;

  const { red, green, blue } = parseToRgb(color);

  return rgb(scoreColor(score, red), scoreColor(score, green), scoreColor(score, blue));
}

export const roundGain = (value: number): number => Math.round(10000 * value) / 10000;
export const roundAbs = (value: number): number => Math.round(value);

type CostValue = {
  cost: number;
  value: number;
  dayGain?: number;
  dayGainAbs?: number;
};

export const getPaperValue = (transactions: Transaction[], price: number): number =>
  price * getTotalUnits(transactions);

export const getRealisedValue = (transactions: Transaction[]): number =>
  transactions.filter(({ units }) => units < 0).reduce((last, { cost }) => last - cost, 0);

export const getBuyCost = (transactions: Transaction[]): number =>
  transactions.filter(({ units }) => units > 0).reduce((last, { cost }) => last + cost, 0);

export type RowGain = Omit<CostValue, 'cost'> & {
  gain: number;
  gainAbs: number;
};

export type RowGains = { [id: string]: RowGain | null };

export const getRowGains = (rows: Fund[], cache: Cache): RowGains =>
  rows.reduce<RowGains>((items, { id, transactions }) => {
    if (!(transactions.length && cache.prices[id]?.values.length)) {
      return { ...items, [id]: null };
    }

    const rowCache = cache.prices[id] ?? { values: [] };

    const price = rowCache.values.length ? rowCache.values[rowCache.values.length - 1] : 0;
    const yesterdayPrice =
      rowCache.values.length > 1 ? rowCache.values[rowCache.values.length - 2] : 0;

    const paperValue = getPaperValue(transactions, price);
    const yesterdayPaperValue = getPaperValue(transactions, yesterdayPrice);

    const realisedValue = getRealisedValue(transactions);

    const cost = getBuyCost(transactions);

    const gainAbs = realisedValue + paperValue - cost;
    const gain = gainAbs / cost;

    const dayGainAbs = paperValue - yesterdayPaperValue;
    const dayGain = dayGainAbs / cost;

    const rowGain: RowGain = {
      value: isSold(transactions) ? paperValue + realisedValue : paperValue,
      gain: roundGain(gain),
      gainAbs: roundAbs(gainAbs),
      dayGain: roundGain(dayGain),
      dayGainAbs: roundAbs(dayGainAbs),
    };

    return { ...items, [id]: rowGain };
  }, {});

const rowGainExists = (rowGain?: RowGain | null): rowGain is RowGain => !!rowGain;

const getMinMax = moize(
  (rowGains: RowGains): [number, number] =>
    Object.keys(rowGains)
      .map<RowGain | null>((id) => rowGains[id])
      .filter<RowGain>(rowGainExists)
      .reduce<[number, number]>(
        ([min, max], rowGain) => [Math.min(min, rowGain.gain), Math.max(max, rowGain.gain)],
        [Infinity, -Infinity],
      ),
  { maxSize: 1 },
);

export type GainsForRow =
  | (RowGain & {
      color: string;
    })
  | null;

export function getGainsForRow(rowGains: RowGains, id: Id): GainsForRow {
  const rowGain = rowGains[id];
  if (!rowGainExists(rowGain)) {
    return null;
  }

  const [min, max] = getMinMax(rowGains);
  return {
    ...rowGains[id],
    color: getFundColor(rowGain.gain ?? 0, min, max),
  } as GainsForRow;
}

const getItemsWithPrices = createSelector(getCurrentFundsCache, getFundsRows, (cache, items) => {
  if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1 && items && items.length)) {
    return [];
  }

  return items.filter(({ id, transactions }) => cache.prices[id] && transactions);
});

const getLatestTimes = createSelector(getCurrentFundsCache, (cache) => {
  if (!(cache && cache.cacheTimes && cache.cacheTimes.length > 1)) {
    return { timeLatest: new Date(), timePrev: new Date() };
  }

  const { cacheTimes, startTime } = cache;

  const timeLatest = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 1]));
  const timePrev = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 2]));

  return { timeLatest, timePrev };
});

const getTodayAndYesterdayTotalValue = createSelector(
  getItemsWithPrices,
  getLatestTimes,
  getCurrentFundsCache,
  (itemsWithPrices, { timeLatest, timePrev }, cache) => {
    const getValue = (maxDate: Date): number => {
      const maxDateValue = getUnixTime(maxDate);

      return itemsWithPrices.reduce((last, { id, transactions }) => {
        const { startIndex = 0, values = [] } = cache?.prices[id] || {};
        const timeIndex =
          (cache?.cacheTimes || []).length -
          1 -
          (cache?.cacheTimes || [])
            .slice()
            .reverse()
            .findIndex((value) => value + (cache?.startTime || 0) <= maxDateValue);

        if (timeIndex >= startIndex + values.length) {
          return last;
        }

        const price = values[timeIndex - startIndex];

        const filteredTransactions = transactions.filter(
          ({ date }) => Number(date) <= Number(maxDate),
        );

        const units = filteredTransactions.reduce((sum, { units: value }) => sum + value, 0);

        return last + price * units;
      }, 0);
    };

    return { latest: getValue(timeLatest), prev: getValue(timePrev) };
  },
);

export const getDayGainAbs = createSelector(
  getItemsWithPrices,
  getLatestTimes,
  getTodayAndYesterdayTotalValue,
  (itemsWithPrices, { timeLatest, timePrev }, values) => {
    if (!(values.latest && values.prev)) {
      return 0;
    }

    const getCost = (maxDate: Date): number =>
      itemsWithPrices.reduce(
        (last, { transactions }) =>
          transactions
            .filter(({ date }) => Number(date) <= Number(maxDate))
            .reduce((sum, { cost }) => sum + cost, last),
        0,
      );

    const costLatest = getCost(timeLatest);
    const costPrev = getCost(timePrev);

    const dayGain = values.latest - values.prev - (costLatest - costPrev);

    return dayGain;
  },
);

export const getDayGain = createSelector(
  getDayGainAbs,
  getTodayAndYesterdayTotalValue,
  (dayGainAbs, { prev }) => (prev ? dayGainAbs / prev : 0),
);
