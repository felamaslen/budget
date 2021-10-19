import type { Monthly } from './gql';
import type { GQL } from '~shared/types';

type OverviewGraphExtra = {
  assets: number[]; // excludes options, includes pension
  liabilities: number[];
  netWorth: number[];
  stocks: number[]; // this excludes cash and is dynamic on current prices
  stockCostBasis: number[]; // illustrates the difference between paper value and cost basis
  pension: number[];
  cashLiquid: number[];
  cashOther: number[]; // e.g. savings accounts, foreign accounts
  investments: number[]; // this includes cash and is based on the recorded value
  investmentPurchases: number[]; // includes stock purchases as well as things like house purchases
  illiquidEquity: number[];
  options: number[]; // excludes SAYE savings (but includes the profit if any at current prices)
  income: number[];
  spending: number[];
  net: number[];
};

export type OverviewGraphValues = GQL<Monthly> & OverviewGraphExtra;

export type OverviewGraphPartial = GQL<Monthly> & Partial<OverviewGraphExtra>;

export type OverviewGraphRequired<
  K extends keyof OverviewGraphExtra,
  G extends OverviewGraphPartial = OverviewGraphPartial,
> = GQL<Monthly> & G & Pick<OverviewGraphValues, K>;

export type OverviewGraphDate = { date: Date; monthIndex: number };

export type MergedOverviewGraphValues = Omit<
  OverviewGraphValues,
  Exclude<keyof Monthly, 'stocks' | 'income' | 'investmentPurchases'>
> & {
  startPredictionIndex: number;
};

export type OverviewGraph = {
  dates: Date[];
  values: OverviewGraphValues;
  startPredictionIndex: number;
};

export type TableValues<
  T = never,
  K extends keyof OverviewGraphValues = keyof OverviewGraphValues,
> = {
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
  include?: (keyof OverviewGraphValues)[];
  exclude?: (keyof OverviewGraphValues)[];
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
