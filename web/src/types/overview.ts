import { DateTime } from 'luxon';

import { Page, PageListCalc } from './app';

export type Cost = {
  [page in PageListCalc | Page.funds]: number[];
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
  startDate: DateTime | null;
  endDate: DateTime | null;
  cost: Cost;
};

export type TableValues<T = never> = {
  [key in keyof CostProcessed]?: T;
} & {
  netWorth: T;
};

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
