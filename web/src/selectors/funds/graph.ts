import getUnixTime from 'date-fns/getUnixTime';
import isAfter from 'date-fns/isAfter';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getRealisedValue, getBuyCost } from './gains';
import { getViewSoldFunds, getFundsCache, getFundsRows, PriceCache } from './helpers';
import { getFundLineProcessed, FundsWithReturns, Return, FundWithReturns } from './lines';
import { Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTotalUnits, isSold, lastInArray } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import {
  FundNative as Fund,
  FundItem,
  FundLine,
  TransactionNative as Transaction,
} from '~client/types';

const getPrices = createSelector(getFundsCache, (cache): PriceCache['prices'] => cache.prices);

export const getStartTime = createSelector(getFundsCache, (cache) => cache.startTime);
export const getCacheTimes = createSelector(getFundsCache, (cache) => cache.cacheTimes);

type WithInfo<V = Record<string, unknown>> = Fund &
  V & {
    transactionsToDate: Transaction[][][];
  };

const getItemsWithInfo = moize(
  (today: Date) =>
    createSelector(
      getFundsRows,
      getPrices,
      getStartTime,
      getCacheTimes,
      (items, prices, startTime, cacheTimes) =>
        items
          .filter(({ id }) => prices[id])
          .map(({ transactions, ...rest }) => ({
            ...rest,
            transactions: transactions.filter(({ date }) => !isAfter(date, today)),
          }))
          .map<WithInfo>(({ id, transactions, ...rest }) => ({
            id,
            ...rest,
            transactions,
            transactionsToDate: prices[id].map<Transaction[][]>((group, groupIndex) =>
              group.values.map<Transaction[]>((_, index) =>
                groupIndex === prices[id].length - 1 && index === group.values.length - 1
                  ? transactions
                  : transactions.filter(
                      ({ date }) =>
                        getUnixTime(date) < startTime + cacheTimes[index + group.startIndex],
                    ),
              ),
            ),
          }))
          .filter(({ transactionsToDate }) =>
            transactionsToDate.some((group) =>
              group.some((transactions) => transactions.length > 0),
            ),
          )
          .map((item) => ({
            ...item,
            latestValue:
              (lastInArray(lastInArray(prices[item.id])?.values ?? []) ?? 0) *
              getTotalUnits(item.transactions),
          }))
          .sort((a, b) => b.latestValue - a.latestValue),
    ),
  { maxSize: 1 },
);

const getHiddenBecauseSold = moize(
  (today: Date) =>
    createSelector(
      getViewSoldFunds,
      getItemsWithInfo(today),
      (viewSold, items): Record<string, boolean> =>
        items.reduce(
          (last, { id, transactions }) => ({
            ...last,
            [id]: !viewSold && isSold(transactions),
          }),
          {},
        ),
    ),
  { maxSize: 1 },
);

const getReturnsById = moize(
  (today: Date) =>
    createSelector(
      getPrices,
      getItemsWithInfo(today),
      (prices, items): FundsWithReturns =>
        items.reduce<FundsWithReturns>(
          (last, { id, transactionsToDate }) => ({
            ...last,
            [id]: prices[id].map<FundWithReturns>(({ startIndex, values }, groupIndex) => ({
              startIndex,
              values: values.map<Return>((price, index) => ({
                price,
                units: getTotalUnits(transactionsToDate[groupIndex][index]),
                cost: getBuyCost(transactionsToDate[groupIndex][index]),
                realised: getRealisedValue(transactionsToDate[groupIndex][index]),
              })),
            })),
          }),
          {},
        ),
    ),
  { maxSize: 1 },
);

export const getFundItems = moize(
  (today: Date) =>
    createSelector(
      getItemsWithInfo(today),
      getHiddenBecauseSold(today),
      (items, hiddenBecauseSold): FundItem[] => [
        {
          id: GRAPH_FUNDS_OVERALL_ID,
          item: 'Overall',
          color: colors.black,
        },
        ...items
          .filter(({ id }) => !hiddenBecauseSold[id])
          .map(({ id, item }) => ({
            id,
            item,
            color: colorKey(item),
          })),
      ],
    ),
  { maxSize: 1 },
);

export const getFundLines = moize(
  (today: Date) =>
    createSelector(
      getFundItems(today),
      getCacheTimes,
      getHiddenBecauseSold(today),
      getReturnsById(today),
      (
        fundItems,
        cacheTimes,
        hiddenBecauseSold,
        fundsWithReturns,
      ): {
        [mode in Mode]: FundLine[];
      } => {
        const getFundLinesByMode = (mode: Mode): FundLine[] =>
          fundItems
            .filter(({ id }) => !hiddenBecauseSold[id])
            .reduce<FundLine[]>((last, { id, color }) => {
              const lines = getFundLineProcessed(fundsWithReturns, cacheTimes, mode, id);

              return [...last, ...lines.map((data) => ({ id, color, data }))];
            }, []);

        return {
          [Mode.ROI]: getFundLinesByMode(Mode.ROI),
          [Mode.Value]: getFundLinesByMode(Mode.Value),
          [Mode.Price]: getFundLinesByMode(Mode.Price),
        };
      },
    ),
  { maxSize: 1 },
);
