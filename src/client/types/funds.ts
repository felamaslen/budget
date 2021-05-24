import type { Fund, FundInput, FundPeriod, StockSplit, Transaction } from './gql';
import type { Data } from './graph';
import type { Id } from './shared';
import type { GQL, GQLShallow, NativeDate } from '~shared/types';

export type TransactionNative = NativeDate<GQL<Transaction>, 'date'>;
export type StockSplitNative = NativeDate<GQL<StockSplit>, 'date'>;
export type NativeFund<F extends FundInput> = Omit<
  GQLShallow<F>,
  'transactions' | 'stockSplits'
> & {
  transactions: TransactionNative[];
  stockSplits: StockSplitNative[];
};

export type FundNative = NativeFund<Fund>;
export type FundInputNative = NativeFund<FundInput>;

export type FundOrder = { time: number; isSell: boolean; isReinvestment: boolean; size: number };

export type FundItem = {
  id: Id;
  item: string;
  color: string;
  orders: FundOrder[];
};

export type FundLine = FundItem & { data: Data };

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

export type HistoryOptions = {
  period: FundPeriod;
  length: number | null;
};

export type FundQuotes = Record<number, number | null>;
