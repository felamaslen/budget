import type { CommonProps, WrapperProps } from '../shared';

import type { StockSplitNative, TransactionNative } from '~client/types';

export type CompositeValue = {
  transactions: TransactionNative[];
  stockSplits: StockSplitNative[];
};

export type TabMode = 'transactions' | 'stockSplits';

export type FieldProps<F> = {
  value: F[] | undefined;
  onChange: (value: F[] | undefined) => void;
};

export type TabModeProps<F> = WrapperProps &
  Pick<CommonProps<F[] | undefined>, 'value' | 'onChange'>;

export type ModalFieldProps<F> = WrapperProps & Pick<CommonProps<F[]>, 'value' | 'onChange'>;

export type PropsTabModeTransactions = TabModeProps<TransactionNative>;

export type PropsTabModeStockSplits = TabModeProps<StockSplitNative>;

type PropsFormFieldPart<F> = {
  item: F;
  index?: number;
  onChange: (index: number, delta: Partial<F>) => void;
  create?: boolean;
};

export type PropsFormFieldStockSplit = PropsFormFieldPart<StockSplitNative>;
export type PropsFormFieldTransaction = PropsFormFieldPart<TransactionNative>;

export type PropsFormFieldModalStockSplits = ModalFieldProps<StockSplitNative>;
export type PropsFormFieldModalTransactions = ModalFieldProps<TransactionNative>;
