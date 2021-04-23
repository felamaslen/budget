import React, { useCallback, useEffect, useRef, useState } from 'react';

import { FormFieldCostInline } from '../cost';
import { FormFieldDateInline } from '../date';
import { FormFieldNumberInline } from '../number';
import { Wrapper, WrapperProps } from '../shared';

import * as Styled from './styles';
import type {
  CompositeValue,
  PropsFormFieldStockSplit,
  PropsFormFieldTransaction,
  PropsTabModeStockSplits,
  PropsTabModeTransactions,
  TabMode,
} from './types';
import { useSingleStockSplitField, useStockSplitsField } from './use-stock-splits-field';
import { useSingleTransactionField, useTransactionsField } from './use-transactions-field';
import { emptyComposite, emptyStockSplits, emptyTransactions, getComponentKey } from './utils';

import { useCTA } from '~client/hooks';
import { ButtonAdd, ButtonDelete, FlexColumn } from '~client/styled/shared';
import type { StockSplitNative, TransactionNative } from '~client/types';

const FormFieldStockSplitInline: React.FC<PropsFormFieldStockSplit> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { date, ratio },
  } = props;
  const { onChangeDate, onChangeRatio } = useSingleStockSplitField(props.onChange, props.index);

  return (
    <Styled.ComponentListItem
      data-testid={create ? 'stock-split-create-input' : 'stock-split-edit-input'}
    >
      <Styled.StockSplitRowDate>
        <FormFieldDateInline value={date} onChange={onChangeDate} />
      </Styled.StockSplitRowDate>
      <Styled.StockSplitRowRatio>
        <FormFieldNumberInline
          allowEmpty
          value={ratio}
          onChange={onChangeRatio}
          min={1}
          step={0.5}
        />
      </Styled.StockSplitRowRatio>
      {children}
    </Styled.ComponentListItem>
  );
};

const TabModeStockSplits: React.FC<PropsTabModeStockSplits> = ({
  value = emptyStockSplits,
  ...props
}) => {
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useStockSplitsField({
    ...props,
    value,
  });

  return (
    <>
      <Styled.ModalHead>
        <Styled.ModalHeadStockSplitDate>Date</Styled.ModalHeadStockSplitDate>
        <Styled.ModalHeadRatio>Ratio</Styled.ModalHeadRatio>
      </Styled.ModalHead>
      <Styled.ComponentList>
        <FormFieldStockSplitInline item={newItem} onChange={onChangeAddField} create>
          <Styled.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </Styled.ComponentRowButton>
        </FormFieldStockSplitInline>
        {items.map((item, index) => (
          <FormFieldStockSplitInline
            key={getComponentKey(item, index)}
            index={index}
            item={item}
            onChange={onUpdate}
          >
            <span>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </span>
          </FormFieldStockSplitInline>
        ))}
      </Styled.ComponentList>
    </>
  );
};

const FormFieldTransactionInline: React.FC<PropsFormFieldTransaction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { date, units, price, fees, taxes },
  } = props;
  const {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
  } = useSingleTransactionField(props.onChange, props.index);

  return (
    <Styled.ComponentListItem
      data-testid={create ? 'transaction-create-input' : 'transaction-edit-input'}
    >
      <Styled.TransactionRowDate>
        <FormFieldDateInline value={date} onChange={onChangeDate} />
      </Styled.TransactionRowDate>
      <FlexColumn>
        <Styled.UnitsPriceRow>
          <Styled.TransactionRowUnits>
            <FormFieldNumberInline allowEmpty value={units} onChange={onChangeUnits} />
          </Styled.TransactionRowUnits>
          <Styled.TransactionRowPrice>
            <FormFieldNumberInline allowEmpty value={price} onChange={onChangePrice} />
          </Styled.TransactionRowPrice>
        </Styled.UnitsPriceRow>
        <Styled.TransactionRowFees>
          <Styled.FeesLabel>Fees</Styled.FeesLabel>
          <FormFieldCostInline allowEmpty value={fees} onChange={onChangeFees} />
          <Styled.FeesLabel>Taxes</Styled.FeesLabel>
          <FormFieldCostInline allowEmpty value={taxes} onChange={onChangeTaxes} />
        </Styled.TransactionRowFees>
      </FlexColumn>
      {children}
    </Styled.ComponentListItem>
  );
};

const TabModeTransactions: React.FC<PropsTabModeTransactions> = ({
  value = emptyTransactions,
  ...props
}) => {
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useTransactionsField({
    ...props,
    value,
  });

  return (
    <>
      <Styled.ModalHead>
        <Styled.ModalHeadTransactionDate>Date</Styled.ModalHeadTransactionDate>
        <Styled.ModalHeadUnits>Units</Styled.ModalHeadUnits>
        <Styled.ModalHeadPrice>Price</Styled.ModalHeadPrice>
      </Styled.ModalHead>
      <Styled.ComponentList>
        <FormFieldTransactionInline item={newItem} onChange={onChangeAddField} create>
          <Styled.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </Styled.ComponentRowButton>
        </FormFieldTransactionInline>
        {items.map((item, index) => (
          <FormFieldTransactionInline
            key={getComponentKey(item, index)}
            index={index}
            item={item}
            onChange={onUpdate}
          >
            <span>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </span>
          </FormFieldTransactionInline>
        ))}
      </Styled.ComponentList>
    </>
  );
};

export type PropsComposite = WrapperProps & {
  value: CompositeValue | undefined;
  onChange: (value: CompositeValue | undefined) => void;
};

export const FormFieldFundMetadata: React.FC<PropsComposite> = ({
  value = emptyComposite,
  onChange,
  ...props
}) => {
  const [focused, setFocused] = useState<boolean>(!!props.active);
  const [tabMode, setTabMode] = useState<TabMode>('transactions');
  const modalRef = useRef<HTMLDivElement>(null);
  const onToggleModal = useCallback(() => setFocused((last) => !last), []);
  const onBlurModal = useCallback((): void => {
    window.setTimeout(() => {
      if (!modalRef.current?.contains(document.activeElement)) {
        setFocused(false);
      }
    }, 0);
  }, []);
  useEffect(() => {
    setFocused(!!props.active);
  }, [props.active]);

  const toggleEvents = useCTA(onToggleModal);

  const onChangeTransactions = useCallback(
    (transactions: TransactionNative[] = []) =>
      onChange({ transactions, stockSplits: value.stockSplits }),
    [onChange, value.stockSplits],
  );

  const onChangeStockSplits = useCallback(
    (stockSplits: StockSplitNative[] = []) =>
      onChange({ stockSplits, transactions: value.transactions }),
    [onChange, value.transactions],
  );

  return (
    <Wrapper item="transactions">
      <Styled.NumTransactions active={props.active} {...toggleEvents}>
        {value.transactions.length}
      </Styled.NumTransactions>
      {focused && (
        <Styled.ComponentModal ref={modalRef} onBlur={onBlurModal}>
          <Styled.TabBar>
            <Styled.TabButton
              active={tabMode === 'transactions'}
              onClick={(): void => setTabMode('transactions')}
            >
              Transactions
            </Styled.TabButton>
            <Styled.TabButton
              active={tabMode === 'stockSplits'}
              onClick={(): void => setTabMode('stockSplits')}
            >
              Stock splits
            </Styled.TabButton>
          </Styled.TabBar>
          <Styled.ModalInner>
            {tabMode === 'transactions' && (
              <TabModeTransactions value={value.transactions} onChange={onChangeTransactions} />
            )}
            {tabMode === 'stockSplits' && (
              <TabModeStockSplits value={value.stockSplits} onChange={onChangeStockSplits} />
            )}
          </Styled.ModalInner>
        </Styled.ComponentModal>
      )}
    </Wrapper>
  );
};
