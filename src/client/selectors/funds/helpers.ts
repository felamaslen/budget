import { compose } from '@typed/compose';
import getUnixTime from 'date-fns/getUnixTime';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { combineStockSplits, sortByKey } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { withoutDeleted } from '~client/selectors/crud';
import type { FundNative as Fund, FundQuotes } from '~client/types';
import { PageNonStandard, RequestType } from '~client/types/enum';
import type { FundPriceGroup } from '~client/types/gql';

export type FundPriceGroupRebased = FundPriceGroup & {
  rebasePriceRatio: number[];
};

type StateSliced = Pick<State, PageNonStandard.Funds>;
export type PriceCache = Pick<State[PageNonStandard.Funds], 'startTime' | 'cacheTimes' | 'prices'>;
export type PriceCacheRebased = Omit<PriceCache, 'prices'> & {
  prices: Record<number, FundPriceGroupRebased[]>;
};

export const getViewSoldFunds = (state: StateSliced): boolean =>
  !!state[PageNonStandard.Funds].viewSoldFunds;

const getFundItemsRows = (state: StateSliced): Fund[] => state[PageNonStandard.Funds].items;

const getOptimisticRows = (state: StateSliced): (RequestType | undefined)[] =>
  state[PageNonStandard.Funds].__optimistic;

export const getFundsRows = createSelector(
  getFundItemsRows,
  getOptimisticRows,
  (items: Fund[], __optimistic: (RequestType | undefined)[]): Fund[] =>
    compose<CrudState<Fund>, Fund[], Fund[]>(
      sortByKey('item'),
      withoutDeleted,
    )({ items, __optimistic }),
);

const getFundsScrapedCache = (state: StateSliced): PriceCache => ({
  startTime: state.funds.startTime,
  cacheTimes: state.funds.cacheTimes,
  prices: state.funds.prices,
});

export const getTodayPrices = (state: StateSliced): FundQuotes =>
  state[PageNonStandard.Funds].todayPrices;
const getTodayPriceTime = (state: StateSliced): number =>
  state[PageNonStandard.Funds].todayPriceFetchTime ?? 0;

const combineRealTimeQuotesWithScrapedCache = (quotes: FundQuotes, latestTime: number) => (
  cache: PriceCache,
): PriceCache => {
  const latestTimeStartIndex = cache.cacheTimes.length - 1;
  if (!Object.keys(quotes).length) {
    return cache;
  }

  const allIds = Array.from(new Set([...Object.keys(cache.prices), ...Object.keys(quotes)]));
  const prices = allIds.reduce<Record<number, FundPriceGroup[]>>((last, id) => {
    const existingCache: FundPriceGroup[] | undefined = Reflect.get(cache.prices, id);
    const realTimeQuote: number | null | undefined = Reflect.get(quotes, id);
    if (existingCache && existingCache.length > 0) {
      return {
        ...last,
        [id]: replaceAtIndex(existingCache, existingCache.length - 1, (prev) => ({
          ...prev,
          values: [...prev.values, realTimeQuote ?? prev.values[prev.values.length - 1]],
        })),
      };
    }
    if (!realTimeQuote) {
      return last;
    }

    return {
      ...last,
      [id]: [
        {
          startIndex: latestTimeStartIndex,
          values: [realTimeQuote],
        },
      ],
    };
  }, {});

  return {
    startTime: cache.startTime,
    cacheTimes: [...cache.cacheTimes, latestTime - cache.startTime],
    prices,
  };
};

const rebaseStockSplitsIntoPastPrices = (funds: Fund[]) => (
  cache: PriceCache,
): PriceCacheRebased => {
  const pricesRebased = Object.entries(cache.prices).reduce<PriceCacheRebased['prices']>(
    (last, [fundId, prices]) => {
      const stockSplits = funds.find((fund) => fund.id === Number(fundId))?.stockSplits ?? [];
      if (!stockSplits.length) {
        return {
          ...last,
          [fundId]: prices.map((group) => ({
            ...group,
            rebasePriceRatio: Array(group.values.length).fill(1),
          })),
        };
      }

      const splitsWithTimeIndex = stockSplits.map(({ date, ratio }) => {
        const splitCacheTime = getUnixTime(date) - cache.startTime;
        return {
          appliesBeforeTimeIndex: cache.cacheTimes.findIndex(
            (cacheTime) => cacheTime > splitCacheTime,
          ),
          ratio,
        };
      });

      const pricesRebasedForFund = prices.map<FundPriceGroupRebased>(({ startIndex, values }) => ({
        startIndex,
        values,
        rebasePriceRatio: values.map<number>((price, index) =>
          combineStockSplits(
            splitsWithTimeIndex.filter(
              ({ appliesBeforeTimeIndex }) =>
                appliesBeforeTimeIndex === -1 || appliesBeforeTimeIndex > startIndex + index,
            ),
          ),
        ),
      }));

      return {
        ...last,
        [fundId]: pricesRebasedForFund,
      };
    },
    cache.prices as PriceCacheRebased['prices'],
  );
  return { ...cache, prices: pricesRebased };
};

export const getFundsCache = createSelector(
  getFundsRows,
  getFundsScrapedCache,
  getTodayPrices,
  getTodayPriceTime,
  (funds, cache, quotes, latestTime): PriceCacheRebased =>
    compose(
      rebaseStockSplitsIntoPastPrices(funds),
      combineRealTimeQuotesWithScrapedCache(quotes, latestTime),
    )(cache),
);
