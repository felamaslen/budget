import { flatten } from 'array-flatten';
import getUnixTime from 'date-fns/getUnixTime';
import isAfter from 'date-fns/isAfter';
import moize from 'moize';
import { rgb, parseToRgb } from 'polished';
import { createSelector } from 'reselect';

import { getFundsCache, getFundsRows, PriceCache } from './helpers';
import { isSold, getTotalUnits, getTotalCost, lastInArray } from '~client/modules/data';
import { memoiseNowAndToday } from '~client/modules/time';
import { colors } from '~client/styled/variables';
import type { FundNative as Fund, Id, TransactionNative as Transaction } from '~client/types';

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
  -getTotalCost(transactions.filter(({ units }) => units < 0));

export const getBuyCost = (transactions: Transaction[]): number =>
  getTotalCost(transactions.filter(({ units }) => units > 0));

export type RowGain = Omit<CostValue, 'cost'> & {
  gain: number;
  gainAbs: number;
};

export type RowGains = { [id: string]: RowGain | null };

export const getRowGains = (rows: Fund[], cache: PriceCache): RowGains =>
  rows.reduce<RowGains>((items, { id, transactions }) => {
    if (
      !(
        transactions.length &&
        cache.prices[id]?.length &&
        cache.prices[id].every(({ values }) => values.length)
      )
    ) {
      return { ...items, [id]: null };
    }

    const flatPriceValues = flatten(cache.prices[id].map(({ values }) => values));

    const latestPrice = lastInArray(flatPriceValues) as number;
    const yesterdayPrice = flatPriceValues[flatPriceValues.length - 2] ?? latestPrice;

    const paperValue = getPaperValue(transactions, latestPrice);
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

const getItemsWithPrices = memoiseNowAndToday((time, key) =>
  createSelector(getFundsCache[key](time), getFundsRows, (cache, items) => {
    if (!(cache.cacheTimes.length > 1 && items.length > 0)) {
      return [];
    }

    return items.filter(({ id, transactions }) => cache.prices[id] && transactions);
  }),
);

const getLatestTimes = memoiseNowAndToday((time, key) =>
  createSelector(getFundsCache[key](time), (cache) => {
    if (cache.cacheTimes.length <= 1) {
      return { timeLatest: new Date(), timePrev: new Date() };
    }

    const { cacheTimes, startTime } = cache;

    const timeLatest = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 1]));
    const timePrev = new Date(1000 * (startTime + cacheTimes[cacheTimes.length - 2]));

    return { timeLatest, timePrev };
  }),
);

const getTodayAndYesterdayTotalValue = memoiseNowAndToday((time, key) =>
  createSelector(
    getItemsWithPrices[key](time),
    getLatestTimes[key](time),
    getFundsCache[key](time),
    (itemsWithPrices, { timeLatest, timePrev }, cache) => {
      const getValue = (maxDate: Date): number => {
        const maxDateValue = getUnixTime(maxDate);
        const startTime = cache.startTime ?? 0;
        const cacheTimes = cache.cacheTimes ?? [];

        return itemsWithPrices.reduce((last, { id, transactions }) => {
          const cacheForFund = cache?.prices[id];
          if (!cacheForFund) {
            return last;
          }
          const latestGroup = cacheForFund[cacheForFund.length - 1];
          if (!(latestGroup && latestGroup.values.length)) {
            return last;
          }
          const { startIndex, values } = latestGroup;

          const timeIndex =
            cacheTimes.length -
            1 -
            cacheTimes
              .slice()
              .reverse()
              .findIndex((value) => value + startTime <= maxDateValue);

          const price = values[timeIndex - startIndex] ?? values[values.length - 1];

          const filteredTransactions = transactions.filter(
            ({ date }) => Number(date) <= Number(maxDate),
          );

          const units = filteredTransactions.reduce((sum, { units: value }) => sum + value, 0);

          return last + price * units;
        }, 0);
      };

      return { latest: getValue(timeLatest), prev: getValue(timePrev) };
    },
  ),
);

export const getDayGainAbs = memoiseNowAndToday((time, key) =>
  createSelector(
    getItemsWithPrices[key](time),
    getLatestTimes[key](time),
    getTodayAndYesterdayTotalValue[key](time),
    (itemsWithPrices, { timeLatest, timePrev }, values) => {
      if (!(values.latest && values.prev)) {
        return 0;
      }

      const getCost = (maxDate: Date): number =>
        itemsWithPrices.reduce(
          (last, { transactions }) =>
            last + getTotalCost(transactions.filter(({ date }) => isAfter(maxDate, date))),
          0,
        );

      const costLatest = getCost(timeLatest);
      const costPrev = getCost(timePrev);

      const dayGain = values.latest - values.prev - (costLatest - costPrev);

      return dayGain;
    },
  ),
);

export const getDayGain = memoiseNowAndToday((time, key) =>
  createSelector(
    getDayGainAbs[key](time),
    getTodayAndYesterdayTotalValue[key](time),
    (dayGainAbs, { prev }) => (prev ? dayGainAbs / prev : 0),
  ),
);
