import getUnixTime from 'date-fns/getUnixTime';
import isAfter from 'date-fns/isAfter';
import moize from 'moize';
import { createSelector } from 'reselect';

import { getRealisedValue, getBuyCost } from './gains';
import { getViewSoldFunds, getCurrentFundsCache, getFundsRows } from './helpers';
import { getFundLineProcessed, FundsWithReturns, Return } from './lines';
import { Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTotalUnits, isSold } from '~client/modules/data';
import { Cache } from '~client/reducers/funds';
import { colors } from '~client/styled/variables';
import { Fund, Transaction, Prices, FundLine, FundItem } from '~client/types';

const getPrices = createSelector(
  getCurrentFundsCache,
  (cache?: Cache): Prices => cache?.prices || {},
);

export const getStartTime = createSelector(
  getCurrentFundsCache,
  (cache?: Cache) => cache?.startTime ?? 0,
);

export const getCacheTimes = createSelector(
  getCurrentFundsCache,
  (cache?: Cache): number[] => cache?.cacheTimes ?? [],
);

type WithInfo<V = {}> = Fund &
  V & {
    transactionsToDate: Transaction[][];
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
          .map<WithInfo>(({ id, transactions, ...rest }) => {
            return {
              id,
              ...rest,
              transactions,
              transactionsToDate: prices[id].values.map((_, index) =>
                index === prices[id].values.length - 1
                  ? transactions
                  : transactions.filter(
                      ({ date }) =>
                        getUnixTime(date) < startTime + cacheTimes[index + prices[id].startIndex],
                    ),
              ),
            };
          })
          .filter(({ transactionsToDate }) => transactionsToDate.some((group) => group.length > 0))
          .map((item) => ({
            ...item,
            latestValue:
              (prices[item.id].values[prices[item.id].values.length - 1] ?? 0) *
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
            [id]: {
              startIndex: prices[id].startIndex,
              returns: prices[id].values.map<Return>((price, index) => ({
                price,
                units: getTotalUnits(transactionsToDate[index]),
                cost: getBuyCost(transactionsToDate[index]),
                realised: getRealisedValue(transactionsToDate[index]),
              })),
            },
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
