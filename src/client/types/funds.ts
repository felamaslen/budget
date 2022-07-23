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

export type FundOrder = {
  time: number;
  isSell: boolean;
  isReinvestment: boolean;
  isPension: boolean;
  fees: number;
  price: number;
  units: number;
  size: number;
};

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
  metadata: {
    unitsBought: number;
    buyPriceSplitAdj: number;
    unitsSold: number;
    sellPriceSplitAdj: number;
    unitsReinvested: number;
    reinvestmentPriceSplitAdj: number;
    feesPaid: number;
    taxesPaid: number;
    currentPrice: number;
    totalCostOfHolding: number;
    pnl: number;
  };
};
export type Portfolio = PortfolioItem[];

export type FundsCachedValue = {
  value: number;
  gain: number;
  gainAbs: number;
  dayGain: number;
  dayGainAbs: number;
};

export type RowPrices = Data[] | null;

export type HistoryOptions = {
  period: FundPeriod;
  length: number | null;
};

export type FundQuotes = Record<number, number | null>;
