import { DateTime } from 'luxon';

import { Data } from '~client/types/graph';
import { Color } from '~client/constants/colors';

export type TransactionRaw = {
  date: string;
  units: number;
  cost: number;
};

export type Transaction = Omit<TransactionRaw, 'date'> & {
  id: string;
  date: Date;
};

export type LegacyTransaction = Omit<Transaction, 'date'> & { date: DateTime };

export type Row = {
  id: string;
  item: string;
  transactions: Transaction[] | null;
};

export type LegacyRow = Omit<Row, 'transactions'> & {
  transactions: LegacyTransaction[] | null;
};

export type FundPrices = {
  values: number[];
  startIndex: number;
};
export type Prices = {
  [id: string]: FundPrices;
};

export type FundItem = {
  id: string;
  item: string;
  color: Color;
};

export type FundLine = Pick<FundItem, 'id' | 'color'> & {
  data: Data;
};

export type Stock = {
  code: string;
  name: string;
  weight: number;
  gain: number;
  price: number | null;
  up: boolean;
  down: boolean;
};

export type Index = Omit<Stock, 'price'> & Partial<Pick<Stock, 'price'>>;
