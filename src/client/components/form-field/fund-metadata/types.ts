import type { ModalFieldProps, PropsFormFieldPart } from '../metadata/types';
import type { CommonProps, WrapperProps } from '../shared';

import type { StockSplitNative, TransactionNative } from '~client/types';

export type CompositeValue = {
  transactions: TransactionNative[];
  stockSplits: StockSplitNative[];
};

export type TabMode = 'transactions' | 'stockSplits';

export type TabModeProps<F> = WrapperProps &
  Pick<CommonProps<F[] | undefined>, 'value' | 'onChange'>;

export type PropsTabModeTransactions = TabModeProps<TransactionNative>;

export type PropsTabModeStockSplits = TabModeProps<StockSplitNative>;

export type PropsFormFieldStockSplit = PropsFormFieldPart<StockSplitNative>;
export type PropsFormFieldTransaction = PropsFormFieldPart<TransactionNative>;

export type PropsFormFieldModalStockSplits = ModalFieldProps<StockSplitNative>;
export type PropsFormFieldModalTransactions = ModalFieldProps<TransactionNative>;
