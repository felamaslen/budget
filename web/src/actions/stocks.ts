import { StocksListResponse, StockPrice } from '~client/types';

export enum ActionTypeStocks {
  Requested = '@@stocks/LIST_REQUESTED',
  Received = '@@stocks/LIST_RECEIVED',
  PricesRequested = '@@stocks/PRICES_REQUESTED',
  PricesReceived = '@@stocks/PRICES_RECEIVED',
}

type Requested = { type: ActionTypeStocks.Requested };

export const stocksListRequested = (): Requested => ({ type: ActionTypeStocks.Requested });

type Received = { type: ActionTypeStocks.Received; res?: StocksListResponse; error?: Error };

export const stocksListReceived = (res?: StocksListResponse, error?: Error): Received => ({
  type: ActionTypeStocks.Received,
  res,
  error,
});

type PricesRequested = { type: ActionTypeStocks.PricesRequested };

export const stockPricesRequested = (): PricesRequested => ({
  type: ActionTypeStocks.PricesRequested,
});

type PricesReceived = {
  type: ActionTypeStocks.PricesReceived;
  res?: StockPrice[];
  error?: Error;
  now: Date;
};

export const stockPricesReceived = (res?: StockPrice[], error?: Error): PricesReceived => ({
  type: ActionTypeStocks.PricesReceived,
  res,
  error,
  now: new Date(),
});

export type ActionStocks = Requested | Received | PricesRequested | PricesReceived;
