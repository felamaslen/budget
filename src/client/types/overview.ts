import type { Monthly } from './gql';
import type { GQL } from './shared';

export type MonthlyProcessed = GQL<Monthly> & {
  netWorth: number[]; // excludes options, includes pension
  stocks: number[]; // this excludes cash and is dynamic on current prices
  investments: number[]; // this includes cash and is based on the recorded value
  pension: number[];
  cashOther: number[]; // e.g. savings accounts, foreign accounts
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
