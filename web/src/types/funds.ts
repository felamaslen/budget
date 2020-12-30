import { NativeDate } from './crud';
import { Fund, FundInput, FundPeriod, Transaction } from './gql';
import { Data } from './graph';
import { GQL, Id } from './shared';

export type TransactionNative = NativeDate<GQL<Transaction>, 'date'>;
export type NativeFund<F extends FundInput> = Omit<GQL<F>, 'transactions'> & {
  transactions: TransactionNative[];
};

export type FundNative = NativeFund<Fund>;
export type FundInputNative = NativeFund<FundInput>;

export type FundItem = {
  id: Id;
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

export type PortfolioItem = {
  id: Id;
  item: string;
  value: number;
  allocationTarget: number;
};
export type Portfolio = PortfolioItem[];

export type CachedValue = {
  value: number;
  gain: number;
  gainAbs: number;
  dayGain: number;
  dayGainAbs: number;
  ageText: string;
};

export type RowPrices = Data[] | null;

export type PeriodOption = {
  name: string;
  query: HistoryOptions;
};

export type HistoryOptions = {
  period: FundPeriod;
  length: number;
};

export type FundQuotes = Record<number, number | null>;
