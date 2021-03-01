import getUnixTime from 'date-fns/getUnixTime';
import isAfter from 'date-fns/isAfter';
import { createSelector } from 'reselect';

import { getRealisedValue, getBuyCost } from './gains';
import { getViewSoldFunds, getFundsCache, getFundsRows } from './helpers';
import { getFundLineProcessed, FundsWithReturns, Return, FundWithReturns } from './lines';
import { Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTotalUnits, isSold, lastInArray } from '~client/modules/data';
import { abbreviateFundName } from '~client/modules/finance';
import { memoiseNowAndToday } from '~client/modules/time';
import { colors } from '~client/styled/variables';
import type {
  FundNative as Fund,
  FundItem,
  FundLine,
  TransactionNative as Transaction,
  StockSplitNative,
} from '~client/types';

type WithInfo<V = Record<string, unknown>> = Fund &
  V & {
    transactionsToDate: Transaction[][][];
  };

const getItemsWithInfo = memoiseNowAndToday((time) =>
  createSelector(getFundsRows, getFundsCache, (items, { prices, startTime, cacheTimes }) =>
    items
      .filter(({ id }) => prices[id])
      .map(({ transactions, ...rest }) => ({
        ...rest,
        transactions: transactions.filter(({ date }) => !isAfter(date, time)),
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
        transactionsToDate.some((group) => group.some((transactions) => transactions.length > 0)),
      )
      .map((item) => ({
        ...item,
        latestValue:
          (lastInArray(lastInArray(prices[item.id])?.values ?? []) ?? 0) *
          getTotalUnits(item.transactions),
      }))
      .sort((a, b) => b.latestValue - a.latestValue),
  ),
);

const getHiddenBecauseSold = memoiseNowAndToday((time, key) =>
  createSelector(
    getViewSoldFunds,
    getItemsWithInfo[key](time),
    (viewSold, items): Record<string, boolean> =>
      items.reduce(
        (last, { id, transactions }) => ({
          ...last,
          [id]: !viewSold && isSold(transactions),
        }),
        {},
      ),
  ),
);

const getReturnsById = memoiseNowAndToday((time, key) =>
  createSelector(
    getFundsRows,
    getFundsCache,
    getItemsWithInfo[key](time),
    (funds, { prices }, items): FundsWithReturns =>
      items.reduce<FundsWithReturns>(
        (last, { id, transactionsToDate }) => ({
          ...last,
          [id]: prices[id].map<FundWithReturns>(
            ({ startIndex, values, rebasePriceRatio }, groupIndex) => {
              const stockSplits: StockSplitNative[] =
                funds.find((fund) => fund.id === id)?.stockSplits ?? [];
              return {
                startIndex,
                values: values.map<Return>((price, index) => ({
                  price,
                  priceRebased: price / rebasePriceRatio[index],
                  units: getTotalUnits(transactionsToDate[groupIndex][index], stockSplits),
                  cost: getBuyCost(transactionsToDate[groupIndex][index]),
                  realised: getRealisedValue(transactionsToDate[groupIndex][index]),
                })),
              };
            },
          ),
        }),
        {},
      ),
  ),
);

export const getFundItems = memoiseNowAndToday((time, key) =>
  createSelector(
    getItemsWithInfo[key](time),
    getHiddenBecauseSold[key](time),
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
          color: colorKey(abbreviateFundName(item)),
        })),
    ],
  ),
);

export const getFundLines = memoiseNowAndToday((time, key) =>
  createSelector(
    getFundItems[key](time),
    getFundsCache,
    getHiddenBecauseSold[key](time),
    getReturnsById[key](time),
    (fundItems, { cacheTimes }, hiddenBecauseSold, fundsWithReturns): Record<Mode, FundLine[]> => {
      const getFundLinesByMode = (mode: Mode): FundLine[] =>
        fundItems
          .filter(({ id }) => !hiddenBecauseSold[id])
          .reduce<FundLine[]>((last, fund) => {
            const lines = getFundLineProcessed(fundsWithReturns, cacheTimes, mode, fund.id);
            return [...last, ...lines.map((data) => ({ ...fund, data }))];
          }, []);

      return {
        [Mode.ROI]: getFundLinesByMode(Mode.ROI),
        [Mode.Value]: getFundLinesByMode(Mode.Value),
        [Mode.Price]: getFundLinesByMode(Mode.Price),
        [Mode.PriceNormalised]: getFundLinesByMode(Mode.PriceNormalised),
      };
    },
  ),
);
