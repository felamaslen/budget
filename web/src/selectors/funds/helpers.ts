import { compose } from '@typed/compose';
import getUnixTime from 'date-fns/getUnixTime';
import { replaceAtIndex } from 'replace-array';
import { createSelector } from 'reselect';

import { sortByKey } from '~client/modules/data';
import { memoiseNowAndToday } from '~client/modules/time';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { withoutDeleted } from '~client/selectors/crud';
import type { FundNative as Fund, FundQuotes } from '~client/types';
import { PageNonStandard, RequestType } from '~client/types/enum';
import type { FundPriceGroup } from '~client/types/gql';

type StateSliced = Pick<State, PageNonStandard.Funds>;
export type PriceCache = Pick<State[PageNonStandard.Funds], 'startTime' | 'cacheTimes' | 'prices'>;

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

const getTodayPrices = (state: StateSliced): FundQuotes => state[PageNonStandard.Funds].todayPrices;

export const getFundsCache = memoiseNowAndToday((time) =>
  createSelector(
    getFundsScrapedCache,
    getTodayPrices,
    (cache, quotes): PriceCache => {
      const latestTime = getUnixTime(time) - cache.startTime;
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
        cacheTimes: [...cache.cacheTimes, latestTime],
        prices,
      };
    },
  ),
);
