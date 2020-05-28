import { PageList } from './app';

export type Cost = {
  [page in PageList]: number[];
} & {
  fundChanges: number[];
  old: number[];
};

export type CostProcessed = Cost & {
  fundsOld: number[];
  spending: number[];
  net: number[];
  netWorth: number[];
  netWorthPredicted: number[];
  netWorthCombined: number[];
};

export type OverviewState = {
  startDate: Date;
  endDate: Date;
  cost: Cost;
};

export type TableValues<T = never, K extends keyof CostProcessed = keyof CostProcessed> = {
  [key in K]: T;
} & {
  netWorth: T;
};

export type OverviewCell = {
  column: ['month' | keyof TableValues, string];
  value: string | number;
  rgb: string | null;
};

export type OverviewTableRow = {
  key: string;
  cells: OverviewCell[];
  past: boolean;
  active: boolean;
  future: boolean;
};

export type OverviewTable = OverviewTableRow[];

export type Target = {
  date: number;
  from: number;
  value: number;
  months: number;
  last: number;
  tag: string;
};

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
