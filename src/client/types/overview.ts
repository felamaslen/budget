import type { Cost } from './gql';
import type { GQL } from './shared';

export type CostProcessed = GQL<Cost> & {
  fundsOld: number[];
  spending: number[];
  net: number[];
  netWorth: number[];
  netWorthPredicted: number[];
  netWorthCombined: number[];
  savingsRatio: number[];
};

export type TableValues<T = never, K extends keyof CostProcessed = keyof CostProcessed> = {
  [key in K]: T;
} & {
  netWorth: T;
};

export type OverviewHeader = Exclude<keyof CostProcessed, 'fundsOld' | 'savingsRatio'>;

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
