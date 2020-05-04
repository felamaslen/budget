import { PageList } from './app';
import { Color } from '~client/constants/colors';

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

export type State = {
  startDate: Date;
  endDate: Date;
  cost: Cost;
};

export type TableValues<T = never> = {
  [key in keyof CostProcessed]?: T;
} & {
  netWorth: T;
};

export type Cell = {
  column: ['month' | keyof TableValues, string];
  value: string | number;
  rgb: Color | null;
};

export type TableRow = {
  key: string;
  cells: Cell[];
  past: boolean;
  active: boolean;
  future: boolean;
};

export type Table = TableRow[];

export type Target = {
  date: number;
  from: number;
  value: number;
  months: number;
  last: number;
  tag: string;
};

export type Range = {
  min: number;
  maxNegative?: number;
  minPositive?: number;
  max: number;
};

export type Median = {
  positive: number;
  negative: number;
};
