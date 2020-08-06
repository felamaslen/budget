import { AbbreviatedItem, ColumnMap } from './list';

export type Transaction = {
  date: string;
  units: number;
  cost: number;
};

export type Fund = {
  id: number;
  item: string;
  transactions: Transaction[];
  allocationTarget: number | null;
};

export type FundsParams = {
  history: boolean;
  period: 'year' | 'month';
  length: number;
};

type FundsResponseBase = {
  data: AbbreviatedItem<Fund>[];
  total: number;
  cashTarget: number;
};

export const columnMapFunds: ColumnMap<Fund> = {
  I: 'id',
  i: 'item',
  tr: 'transactions',
  allocationTarget: 'allocationTarget',
};

export type FundWithHistory = AbbreviatedItem<Fund, typeof columnMapFunds> & {
  pr: number[];
  prStartIndex: number;
};

export type FundsResponseHistory = {
  data: FundWithHistory[];
  total: number;
  startTime: number;
  cacheTimes: number[];
};

export type FundsResponse = FundsResponseBase | FundsResponseHistory;
