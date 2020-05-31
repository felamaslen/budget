import { replaceAtIndex } from 'replace-array';

import { Action, ActionTypeStocks } from '~client/actions';
import { STOCK_INDICES, STOCKS_GRAPH_RESOLUTION } from '~client/constants/stocks';
import { limitTimeSeriesLength } from '~client/modules/data';
import { Stock, Index, StockPrice, Data, StocksListResponse } from '~client/types';

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

const onStocksList = (state: State, res?: StocksListResponse): State => ({
  ...state,
  loading: false,
  lastPriceUpdate: null,
  shares:
    res?.data.stocks.reduce<Stock[]>((last, [code, name, weight]) => {
      const codeIndex = last.findIndex(({ code: lastCode }) => lastCode === code);
      if (codeIndex === -1) {
        return [
          ...last,
          {
            code,
            name,
            weight: weight / res.data.total,
            gain: 0,
            price: null,
            up: false,
            down: false,
          },
        ];
      }

      return replaceAtIndex(last, codeIndex, (value) => ({
        ...value,
        weight: value.weight + weight / res.data.total,
      }));
    }, []) ?? [],
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

function onStocksPrices(state: State, now: Date, res?: StockPrice[]): State {
  if (!res) {
    return state;
  }

  const lastPriceUpdate = now.getTime();
  const shares = state.shares.map(updateStock(res));

  const weightedGain = shares.reduce((last, { gain, weight }) => last + gain * weight, 0);

  return {
    ...state,
    lastPriceUpdate,
    indices: state.indices.map(updateStock<Index>(res)),
    shares,
    history: limitTimeSeriesLength(state.history, STOCKS_GRAPH_RESOLUTION).concat([
      [lastPriceUpdate, weightedGain],
    ]),
  };
}

export default function stocks(state: State = initialState, action: Action): State {
  switch (action.type) {
    case ActionTypeStocks.Requested:
      return { ...state, loading: true };
    case ActionTypeStocks.Received:
      return onStocksList(state, action.res);
    case ActionTypeStocks.PricesReceived:
      return onStocksPrices(state, action.now, action.res);
    default:
      return state;
  }
}
