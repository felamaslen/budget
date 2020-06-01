import { ListItem, RawListItem } from './shared';
import { DataKeyAbbr } from '~client/constants/api';
import { Data } from '~client/types/graph';

export type TransactionRaw = {
  date: string;
  units: number;
  cost: number;
};

export type Transaction = Omit<TransactionRaw, 'date'> & {
  id: string;
  date: Date;
};

export type Fund = ListItem & {
  transactions: Transaction[];
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
  color: string;
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

type FundRaw = RawListItem & {
  [DataKeyAbbr.transactions]: TransactionRaw[] | null;
  pr: number[];
  prStartIndex: number;
};

export type ReadResponseFunds = {
  data: FundRaw[];
  startTime: number;
  cacheTimes: number[];
};

type PortfolioItem = {
  id: string;
  item: string;
  value: number;
};
export type Portfolio = PortfolioItem[];

export type CachedValue = {
  value: number;
  dayGain: number;
  dayGainAbs: number;
  ageText: string;
};
