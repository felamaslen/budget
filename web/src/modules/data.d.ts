import { DateTime } from 'luxon';

import { LegacyTransaction as Transaction, TransactionRaw } from '~client/types/funds';
import { Data as Line } from '~client/types/graph';
import { Average } from '~client/constants';

type LegacyTransactionRaw = Omit<TransactionRaw, 'date'> & {
  date: DateTime | string;
};

export const getTransactionsList: (transactions: LegacyTransactionRaw[]) => Transaction[];

export const isSold: (transactions: Transaction[]) => boolean;
export const getTotalUnits: (transactions: Transaction[]) => number;
export const getTotalCost: (transactions: Transaction[]) => number;

export const addToTransactionsList: (
  transactions: Transaction[],
  item: LegacyTransactionRaw,
) => Transaction[];

export const modifyTransaction: (
  transactions: Transaction[],
  index: number,
  item: Partial<LegacyTransactionRaw>,
) => Transaction[];

export const modifyTransactionById: (
  transactions: Transaction[],
  id: string,
  item: Partial<LegacyTransactionRaw>,
) => Transaction[];

type SortByKey<T> = (...keys: string[]) => (items: T[]) => T[];

export const sortByKey: SortByKey;

export const randnBm: () => number;

export const fieldExists: <V = never>(value: V) => boolean;

export const NULL: () => null;

export type Identity<I, O = I> = (state: I) => O;
export const IDENTITY: Identity;

export const arrayAverage: <T>(values: T[], mode?: Average) => number | NaN;

export const leftPad: (array: number[], length: number) => number[];

export const sortByDate: <T extends { date: Date | DateTime }>(data: T[]) => T[];

export const getValueFromTransmit: <I = never, O = I>(dataType: string, value: I) => O;
export const getValueForTransmit: <I = never, O = I>(dataType: string, value: I) => O;

export const withoutDeleted: <I = never>(items: I[]) => I[];

export const limitTimeSeriesLength: (timeSeries: Line, limit: number) => Line;
