import type { CompositeValue } from './types';

import type { StockSplitNative, TransactionNative } from '~client/types';

export const getComponentKey = (
  { date }: StockSplitNative | TransactionNative,
  index: number,
): string => `${date.toISOString()}-${index}`;

export const emptyStockSplits: StockSplitNative[] = [];
export const emptyTransactions: TransactionNative[] = [];

export const emptyComposite: CompositeValue = {
  transactions: [],
  stockSplits: [],
};
