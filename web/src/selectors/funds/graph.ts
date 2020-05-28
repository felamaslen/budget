import { createSelector } from 'reselect';

import { getViewSoldFunds, getCurrentFundsCache, getFundsRows } from './helpers';
import { getFundLineProcessed, PUC } from './lines';
import { Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import * as Color from '~client/modules/color';
import { getTotalUnits, getTotalCost, isSold } from '~client/modules/data';
import * as Funds from '~client/reducers/funds';
import { colors } from '~client/styled/variables';
import { Data, Fund, Transaction, Prices, FundPrices, FundLine, FundItem } from '~client/types';

type IndexedNumber = { [id: string]: number };
type IndexedNumberArray = { [id: string]: number[] };
type IndexedBool = { [id: string]: boolean };

type TimeOffsets = IndexedNumber;
type RowLengths = IndexedNumber;

const getPrices = createSelector(
  getCurrentFundsCache,
  (cache?: Funds.Cache): Prices => cache?.prices || {},
);

export const getStartTime = createSelector(
  getCurrentFundsCache,
  (cache?: Funds.Cache) => cache?.startTime ?? 0,
);

export const getCacheTimes = createSelector(
  getCurrentFundsCache,
  (cache?: Funds.Cache): number[] => cache?.cacheTimes || [],
);

const getTimeOffsets = createSelector(getPrices, (prices) =>
  Object.entries(prices).reduce(
    (last: TimeOffsets, [id, { startIndex }]: [string, FundPrices]): TimeOffsets => ({
      ...last,
      [id]: startIndex,
    }),
    {},
  ),
);

const getRowLengths = createSelector(
  [getPrices, getTimeOffsets],
  (prices, timeOffsets: TimeOffsets) =>
    Object.keys(prices).reduce(
      (last, id) => ({
        ...last,
        [id]: prices[id].values.length + timeOffsets[id],
      }),
      {},
    ),
);

const getMaxLength = createSelector(
  getPrices,
  getRowLengths,
  (prices, rowLengths: RowLengths): number =>
    Object.keys(prices).reduce((last, id) => Math.max(last, rowLengths[id]), 0),
);

type WithInfo<V = {}> = Fund &
  V & {
    transactionsToDate: Transaction[][];
  };

const getItemsWithInfo = createSelector(
  [getFundsRows, getPrices, getStartTime, getCacheTimes],
  (items: Fund[], prices: Prices, startTime, cacheTimes) =>
    items
      .filter(({ id }) => prices[id])
      .map(
        ({ id, transactions, ...rest }): WithInfo => ({
          id,
          ...rest,
          transactions,
          transactionsToDate: prices[id].values.map((_, index) =>
            (transactions || []).filter(
              ({ date }) =>
                Number(date) <
                1000 * ((startTime || 0) + cacheTimes[index + prices[id].startIndex]),
            ),
          ),
        }),
      ),
);

const getTimesById = createSelector(
  [getPrices, getCacheTimes, getTimeOffsets, getRowLengths, getMaxLength],
  (
    prices: Prices,
    cacheTimes: number[],
    timeOffsets: TimeOffsets,
    rowLengths: RowLengths,
    maxLength: number,
  ) =>
    Object.keys(prices).reduce(
      (items, id) => ({
        ...items,
        [id]: cacheTimes.slice(timeOffsets[id], timeOffsets[id] + rowLengths[id]),
      }),
      {
        [GRAPH_FUNDS_OVERALL_ID]: cacheTimes.slice(0, maxLength),
      },
    ),
);

const getSoldById = createSelector([getViewSoldFunds, getItemsWithInfo], (viewSold, items) =>
  items.reduce(
    (last, { id, transactions }) => ({
      ...last,
      [id]: !viewSold && isSold(transactions || []),
    }),
    {},
  ),
);

const getPricesById = createSelector(
  [getPrices, getItemsWithInfo],
  (prices: Prices, items: WithInfo[]): PUC =>
    items.reduce(
      (last, { id }) => ({
        ...last,
        [id]: prices[id].values,
      }),
      {},
    ),
);

const getUnitsById = createSelector(
  [getPricesById, getItemsWithInfo],
  (prices: { [id: string]: number[] }, items: WithInfo[]) =>
    items.reduce(
      (last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((_, index) => getTotalUnits(transactionsToDate[index])),
      }),
      {},
    ),
);

const getCostsById = createSelector(
  [getPricesById, getItemsWithInfo],
  (prices: { [id: string]: number[] }, items: WithInfo[]) =>
    items.reduce(
      (last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((_, index) => getTotalCost(transactionsToDate[index])),
      }),
      {},
    ),
);

export const getFundItems = createSelector(
  [getItemsWithInfo, getSoldById],
  (items: Omit<FundItem, 'color'>[], soldList: { [id: string]: boolean }): FundItem[] => [
    {
      id: GRAPH_FUNDS_OVERALL_ID,
      item: 'Overall',
      color: colors.black,
    },
    ...items
      .filter(({ id }) => !soldList[id])
      .map(({ id, item }) => ({
        id,
        item,
        color: Color.colorKey(item),
      })),
  ],
);

type Times = IndexedNumberArray;
type Sold = IndexedBool;

export const getFundLines = createSelector(
  [
    getFundItems,
    getTimesById,
    getTimeOffsets,
    getSoldById,
    getPricesById,
    getUnitsById,
    getCostsById,
  ],
  (
    fundItems: FundItem[],
    times: Times,
    timeOffsets: TimeOffsets,
    sold: Sold,
    prices: PUC,
    units: PUC,
    costs: PUC,
  ): {
    [mode in Mode]: FundLine[];
  } => {
    const getFundLinesByMode = (mode: Mode): FundLine[] =>
      fundItems.reduce((last: FundLine[], { id, color }): FundLine[] => {
        if (sold[id] || !(times[id] && times[id].length > 1)) {
          return last;
        }

        const lines: Data[] | null = getFundLineProcessed(
          times[id],
          timeOffsets,
          { prices, units, costs },
          mode,
          id,
        );
        if (!lines) {
          return last;
        }

        return last.concat(
          lines.map((data) => ({
            id,
            color,
            data,
          })),
        );
      }, []);

    return {
      [Mode.ROI]: getFundLinesByMode(Mode.ROI),
      [Mode.Value]: getFundLinesByMode(Mode.Value),
      [Mode.Price]: getFundLinesByMode(Mode.Price),
    };
  },
);
