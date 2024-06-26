import getUnixTime from 'date-fns/getUnixTime';
import isAfter from 'date-fns/isAfter';
import { createSelector } from 'reselect';

import { getRealisedValue, getBuyCost } from './gains';
import { FundPriceGroupRebased, getFundsCache, getFundsRows, getViewSoldFunds } from './helpers';
import { getFundLineProcessed, FundsWithReturns, Return, FundWithReturns } from './lines';
import { GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { colorKey } from '~client/modules/color';
import { getTotalUnits, isSold, lastInArray } from '~client/modules/data';
import { memoiseNowAndToday } from '~client/modules/time';
import { colors } from '~client/styled/variables';
import type {
  FundItem,
  FundLine,
  FundModeLine,
  FundNative as Fund,
  FundOrder,
  TransactionNative as Transaction,
} from '~client/types';
import { FundMode } from '~client/types/enum';
import { abbreviateFundName } from '~shared/abbreviation';

type WithInfo<V = Record<string, unknown>> = Fund &
  V & {
    transactionsToDate: Transaction[][][];
  };

const pricesFallback: FundPriceGroupRebased[] = [
  { startIndex: 0, values: [0], rebasePriceRatio: [1] },
];

const getItemsWithInfo = memoiseNowAndToday((time) =>
  createSelector(getFundsRows, getFundsCache, (items, { prices, startTime, cacheTimes }) =>
    items
      .map(({ transactions, ...rest }) => ({
        ...rest,
        transactions: transactions.filter(({ date }) => !isAfter(date, time)),
      }))
      .map<WithInfo>(({ id, transactions, ...rest }) => ({
        id,
        ...rest,
        transactions,
        transactionsToDate: (prices[id] ?? pricesFallback).map<Transaction[][]>(
          (group, groupIndex) =>
            group.values.map<Transaction[]>((_, index) =>
              groupIndex === (prices[id] ?? pricesFallback).length - 1 &&
              index === group.values.length - 1
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
      .map(({ cachedPrices, ...item }) => ({
        ...item,
        latestValue:
          (lastInArray(lastInArray(prices[item.id] ?? [])?.values ?? []) ?? 0) *
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
          [id]: (prices[id] ?? pricesFallback).map<FundWithReturns>(
            ({ startIndex, values, rebasePriceRatio }, groupIndex) => {
              const stockSplits = funds.find((fund) => fund.id === id)?.stockSplits ?? [];
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

const mapFundOrder = ({
  date,
  drip,
  fees,
  taxes,
  units,
  pension,
  price,
}: Transaction): FundOrder => ({
  time: getUnixTime(date),
  isSell: units < 0,
  isReinvestment: drip,
  isPension: pension,
  fees: fees + taxes,
  units: Math.abs(units),
  price,
  size: Math.abs(units * price),
});

const sortFundOrders = (orders: FundOrder[]): FundOrder[] =>
  orders.slice().sort((a, b) => a.time - b.time);

export const getFundItems = memoiseNowAndToday((time, key) =>
  createSelector(
    getItemsWithInfo[key](time),
    getHiddenBecauseSold[key](time),
    (items, hiddenBecauseSold): FundItem[] => [
      {
        id: GRAPH_FUNDS_OVERALL_ID,
        item: 'Overall',
        color: colors.black,
        orders: sortFundOrders(
          items.reduce<FundOrder[]>(
            (last, { transactions }) => [...last, ...transactions.map(mapFundOrder)],
            [],
          ),
        ),
        transactions: [],
      },
      ...items
        .filter(({ id }) => !hiddenBecauseSold[id])
        .map(({ id, item, transactions }) => ({
          id,
          item,
          color: colorKey(abbreviateFundName(item)),
          orders: sortFundOrders(transactions.map(mapFundOrder)),
          transactions,
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
    (
      fundItems,
      { cacheTimes },
      hiddenBecauseSold,
      fundsWithReturns,
    ): Record<FundModeLine, FundLine[]> => {
      const getFundLinesByMode = (mode: FundMode): FundLine[] =>
        fundItems
          .filter(({ id }) => !hiddenBecauseSold[id])
          .reduce<FundLine[]>((last, fund) => {
            const lines = getFundLineProcessed(fundsWithReturns, cacheTimes, mode, fund.id);
            return [...last, ...lines.map((data) => ({ ...fund, data }))];
          }, []);

      return {
        [FundMode.Roi]: getFundLinesByMode(FundMode.Roi),
        [FundMode.Value]: getFundLinesByMode(FundMode.Value),
        [FundMode.Stacked]: getFundLinesByMode(FundMode.Stacked),
        [FundMode.Allocation]: getFundLinesByMode(FundMode.Allocation),
        [FundMode.Price]: getFundLinesByMode(FundMode.Price),
        [FundMode.PriceNormalised]: getFundLinesByMode(FundMode.PriceNormalised),
      };
    },
  ),
);
