import type { Monthly } from './gql';
import type { GQL } from './shared';

export type MonthlyProcessed = GQL<Monthly> & {
  assets: number[]; // excludes options, includes pension
  liabilities: number[];
  netWorth: number[];
  stocks: number[]; // this excludes cash and is dynamic on current prices
  stockCostBasis: number[]; // illustrates the difference between paper value and cost basis
  pension: number[];
  cashOther: number[]; // e.g. savings accounts, foreign accounts
  investments: number[]; // this includes cash and is based on the recorded value
  homeEquity: number[];
  options: number[]; // excludes SAYE savings (but includes the profit if any at current prices)
  income: number[];
  spending: number[];
  net: number[];
};

export type MonthlyProcessedKey = keyof Omit<MonthlyProcessed, keyof Monthly>;

export type MonthlyWithPartialProcess = GQL<Monthly> &
  Partial<Omit<MonthlyProcessed, keyof Monthly>>;
export type MonthlyWithProcess<K extends MonthlyProcessedKey> = Monthly & Pick<MonthlyProcessed, K>;

export type MergedMonthly = Omit<
  MonthlyProcessed,
  Exclude<keyof Monthly, 'stocks' | 'income' | 'investmentPurchases'>
> & {
  startPredictionIndex: number;
};

export type TableValues<T = never, K extends keyof MonthlyProcessed = keyof MonthlyProcessed> = {
  [key in K]: T;
} & {
  netWorth: T;
};

export type OverviewHeader = keyof GQL<Monthly> | 'stocks' | 'netWorth' | 'spending' | 'net';

export type OverviewCell = {
  value: number;
  rgb: string;
};

export type OverviewTableRow = {
  year: number;
  month: number;
  monthText: string;
  cells: { [column in OverviewHeader]: OverviewCell };
  past: boolean;
  active: boolean;
  future: boolean;
};

export type OverviewTable = OverviewTableRow[];

export type OverviewColumn = {
  name: string;
  link?: {
    to: string;
    replace?: boolean;
  };
  include?: (keyof MonthlyProcessed)[];
  exclude?: (keyof MonthlyProcessed)[];
};

export type OverviewTableColumn = [OverviewHeader, OverviewColumn];

export type SplitRange = {
  min: number;
  maxNegative?: number;
  minPositive?: number;
  max: number;
};

export type Median = {
  positive: number;
  negative: number;
};
