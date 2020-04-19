import { createSelector } from 'reselect';
import { Mode, GRAPH_FUNDS_OVERALL_ID } from '~client/constants/graph';
import { COLOR_GRAPH_FUND_LINE } from '~client/constants/colors';
import { colorKey } from '~client/modules/color';
import { getTotalUnits, getTotalCost, isSold } from '~client/modules/data';
import {
  getViewSoldFunds,
  getCurrentFundsCache,
  getFundsRows,
} from '~client/selectors/funds/helpers';
import { getFundLineProcessed } from '~client/selectors/funds/lines';
import { Data } from '~client/types/graph';
import { Row, Prices, FundLine, FundItem } from '~client/types/funds';

type IndexedNumber = { [id: string]: number };
type IndexedNumberArray = { [id: string]: number[] };
type IndexedBool = { [id: string]: boolean };

type TimeOffsets = IndexedNumber;
type RowLengths = IndexedNumber;

const getPrices = createSelector(getCurrentFundsCache, ({ prices }) => prices);

export const getStartTime = createSelector(getCurrentFundsCache, ({ startTime }) => startTime);

export const getCacheTimes = createSelector(getCurrentFundsCache, ({ cacheTimes }) => cacheTimes);

const getTimeOffsets = createSelector(getPrices, prices =>
  Object.keys(prices).reduce(
    (last, id) => ({
      ...last,
      [id]: prices[id].startIndex,
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

const getMaxLength = createSelector(getPrices, getRowLengths, (prices, rowLengths: RowLengths) =>
  Object.keys(prices).reduce((last, id) => Math.max(last, rowLengths[id]), 0),
);

const getItemsWithInfo = createSelector(
  [getFundsRows, getPrices, getStartTime, getCacheTimes],
  (items: Row[], prices: Prices, startTime, cacheTimes) =>
    items
      .filter(({ id }) => prices[id])
      .map(({ id, transactions, ...rest }) => ({
        id,
        ...rest,
        transactions,
        transactionsToDate: prices[id].values.map((price, index) =>
          transactions.filter(
            ({ date }) =>
              Number(date) < 1000 * (startTime + cacheTimes[index + prices[id].startIndex]),
          ),
        ),
      })),
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
      [id]: !viewSold && isSold(transactions),
    }),
    {},
  ),
);

const getPricesById = createSelector([getPrices, getItemsWithInfo], (prices, items) =>
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
  (prices: { [id: string]: number[] }, items) =>
    items.reduce(
      (last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((price, index) => getTotalUnits(transactionsToDate[index])),
      }),
      {},
    ),
);

const getCostsById = createSelector(
  [getPricesById, getItemsWithInfo],
  (prices: { [id: string]: number[] }, items) =>
    items.reduce(
      (last, { id, transactionsToDate }) => ({
        ...last,
        [id]: prices[id].map((price, index) => getTotalCost(transactionsToDate[index])),
      }),
      {},
    ),
);

export const getFundItems = createSelector(
  [getItemsWithInfo, getSoldById],
  (items: Omit<FundItem, 'color'>[], soldList: { [id: string]: boolean }): FundItem[] =>
    [
      {
        id: GRAPH_FUNDS_OVERALL_ID,
        item: 'Overall',
        color: COLOR_GRAPH_FUND_LINE,
      },
    ].concat(
      items
        .filter(({ id }) => !soldList[id])
        .map(({ id, item }) => ({
          id,
          item,
          color: colorKey(item),
        })),
    ),
);

type Times = IndexedNumberArray;
type Sold = IndexedBool;

type Units = IndexedNumberArray;
type Costs = IndexedNumberArray;

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
    prices: Prices,
    units: Units,
    costs: Costs,
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
          lines.map(data => ({
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
