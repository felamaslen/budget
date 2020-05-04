import { Data } from '~client/types/graph';
import { Color } from '~client/constants/colors';
import { DataKeyAbbr } from '~client/constants/data';

export type TransactionRaw = {
  date: string;
  units: number;
  cost: number;
};

export type Transaction = Omit<TransactionRaw, 'date'> & {
  id: string;
  date: Date;
};

export type Row = {
  id: string;
  item: string;
  transactions: Transaction[] | null;
};

export type FundPrices = {
  values: number[];
  startIndex: number;
};
export type Prices = {
  [id: string]: FundPrices;
};

export type FundItem = {
  id: string;
  item: string;
  color: Color;
};

export type FundLine = Pick<FundItem, 'id' | 'color'> & {
  data: Data;
};

export type Stock = {
  code: string;
  name: string;
  weight: number;
  gain: number;
  price: number | null;
  up: boolean;
  down: boolean;
};

export type Index = Omit<Stock, 'price' | 'weight'> & Partial<Pick<Stock, 'price'>>;

export type StockPrice = {
  code: string;
  open: number;
  close: number;
};

export type ItemRaw = {
  [DataKeyAbbr.id]: string;
  [DataKeyAbbr.item]: string;
  [DataKeyAbbr.transactions]: TransactionRaw[] | null;
  pr: number[];
  prStartIndex: number;
};

export type ReadResponse = {
  data: ItemRaw[];
  startTime: number;
  cacheTimes: number[];
};
