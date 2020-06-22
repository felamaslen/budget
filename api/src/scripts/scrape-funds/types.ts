export type CLIOptions = {
  holdings: boolean;
  prices: boolean;
};

export enum Broker {
  HL = 'hl',
}

export type Fund = {
  uid: number;
  name: string;
  broker: Broker;
  units: number;
  cost: number;
  url: string;
};

export type DataByUrl = {
  [url: string]: string;
};

export type Holding = {
  name: string;
  value: number;
};

export type CurrencyPrices = {
  GBP?: number;
};

export enum LongFundType {
  Income = 'income',
  AccumInc = 'accumulation-inclusive',
  Accum = 'accumulation',
  Share = 'share',
}

export enum ShortFundType {
  Income = 'inc',
  AccumInc = 'accum-inc',
  Accum = 'accum',
  Share = 'share',
}

export type WeightedHolding = {
  uid: number;
  name: string;
  weight: number;
  subweight: number;
};

export type Stock = {
  uid: number;
  name: string;
  code: string;
  weight: number;
  subweight: number;
};

export type StockCode = string | null;

export type StockCodes = {
  [name: string]: StockCode;
};
