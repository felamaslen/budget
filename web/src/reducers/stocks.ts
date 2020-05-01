import { replaceAtIndex } from 'replace-array';
import { createReducerObject, Action } from 'create-reducer-object';

import { Stock, Index, StockPrice } from '~client/types/funds';
import { Data } from '~client/types/graph';
import { limitTimeSeriesLength } from '~client/modules/data';

import {
  STOCKS_LIST_REQUESTED,
  STOCKS_LIST_RECEIVED,
  STOCKS_PRICES_RECEIVED,
} from '~client/constants/actions/stocks';

import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '~client/constants/stocks';

export type State = {
  loading: boolean;
  indices: Index[];
  shares: Stock[];
  history: Data;
  lastPriceUpdate: number | null;
};

export const initialState: State = {
  loading: false,
  indices: Object.entries(STOCK_INDICES).map(([code, name]) => ({
    code,
    name,
    gain: 0,
    up: false,
    down: false,
  })),
  shares: [],
  history: [],
  lastPriceUpdate: null,
};

const onStocksList = (
  _: State,
  {
    res: {
      data: { stocks, total },
    },
  }: Action,
): Partial<State> => ({
  loading: false,
  lastPriceUpdate: null,
  shares: stocks.reduce((last: Stock[], [code, name, weight]: [string, string, number]) => {
    const codeIndex = last.findIndex(({ code: lastCode }) => lastCode === code);
    if (codeIndex === -1) {
      return [
        ...last,
        {
          code,
          name,
          weight: weight / total,
          gain: 0,
          price: null,
          up: false,
          down: false,
        },
      ];
    }

    return replaceAtIndex(last, codeIndex, value => ({
      ...value,
      weight: value.weight + weight / total,
    }));
  }, []),
});

const updateStock = <S extends { code: string; gain: number } = Stock>(prices: StockPrice[]) => (
  stock: S,
): S => {
  const match = prices.find(({ code: priceCode }) => priceCode === stock.code);
  if (!match) {
    return stock;
  }

  const { open, close } = match;
  const newGain = 100 * ((close - open) / open);

  return {
    ...stock,
    code: stock.code,
    gain: newGain,
    up: stock.gain !== null && newGain > stock.gain,
    down: stock.gain !== null && newGain < stock.gain,
    price: close,
  };
};

function onStocksPrices(state: State, { res }: Action): Partial<State> {
  if (!res) {
    return {};
  }

  const lastPriceUpdate = Date.now();
  const shares = state.shares.map(updateStock(res));

  const weightedGain = shares.reduce((last, { gain, weight }) => last + gain * weight, 0);

  return {
    lastPriceUpdate,
    indices: state.indices.map(updateStock<Index>(res)),
    shares,
    history: limitTimeSeriesLength(state.history, STOCKS_GRAPH_RESOLUTION).concat([
      [Date.now(), weightedGain],
    ]),
  };
}

const handlers = {
  [STOCKS_LIST_REQUESTED]: (): Partial<State> => ({ loading: true }),
  [STOCKS_LIST_RECEIVED]: onStocksList,
  [STOCKS_PRICES_RECEIVED]: onStocksPrices,
};

export default createReducerObject(handlers, initialState);
