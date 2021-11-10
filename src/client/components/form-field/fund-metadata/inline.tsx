import { useCallback, useState } from 'react';

import { FormFieldCostInline } from '../cost';
import { FormFieldDateInline } from '../date';
import { useModalFocus } from '../metadata/hooks';
import * as StyledCommon from '../metadata/styles';
import { FormFieldNumberInline } from '../number';
import { Wrapper, WrapperProps } from '../shared';

import { FormFieldTickbox } from '../tickbox';
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
    <StyledCommon.ComponentListItem
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
    </StyledCommon.ComponentListItem>
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
      <StyledCommon.ModalHead>
        <Styled.ModalHeadStockSplitDate>Date</Styled.ModalHeadStockSplitDate>
        <Styled.ModalHeadRatio>Ratio</Styled.ModalHeadRatio>
      </StyledCommon.ModalHead>
      <StyledCommon.ComponentList>
        <FormFieldStockSplitInline item={newItem} onChange={onChangeAddField} create>
          <StyledCommon.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </StyledCommon.ComponentRowButton>
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
      </StyledCommon.ComponentList>
    </>
  );
};

const FormFieldTransactionInline: React.FC<PropsFormFieldTransaction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { date, units, price, fees, taxes, drip, pension },
  } = props;
  const {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
    onChangeDrip,
    onChangePension,
  } = useSingleTransactionField(props.onChange, props.index);

  return (
    <StyledCommon.ComponentListItem
      data-testid={create ? 'transaction-create-input' : 'transaction-edit-input'}
      isDrip={props.item.drip}
    >
      <Styled.TransactionRowDate>
        <FormFieldDateInline value={date} onChange={onChangeDate} />
        <Styled.TransactionInlineDRIP>
          <span>DRIP:</span>
          <FormFieldTickbox value={drip} onChange={onChangeDrip} />
          <span>SIPP:</span>
          <FormFieldTickbox value={pension} onChange={onChangePension} />
        </Styled.TransactionInlineDRIP>
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
        <Styled.TransactionRowSmall>
          <Styled.FeesLabel>Fees</Styled.FeesLabel>
          <FormFieldCostInline allowEmpty value={fees} onChange={onChangeFees} />
          <Styled.FeesLabel>Taxes</Styled.FeesLabel>
          <FormFieldCostInline allowEmpty value={taxes} onChange={onChangeTaxes} />
        </Styled.TransactionRowSmall>
      </FlexColumn>
      {children}
    </StyledCommon.ComponentListItem>
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
      <StyledCommon.ModalHead>
        <Styled.ModalHeadTransactionDate>Date</Styled.ModalHeadTransactionDate>
        <Styled.ModalHeadUnits>Units</Styled.ModalHeadUnits>
        <Styled.ModalHeadPrice>Price</Styled.ModalHeadPrice>
      </StyledCommon.ModalHead>
      <StyledCommon.ComponentList>
        <FormFieldTransactionInline item={newItem} onChange={onChangeAddField} create>
          <StyledCommon.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </StyledCommon.ComponentRowButton>
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
      </StyledCommon.ComponentList>
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
  const [tabMode, setTabMode] = useState<TabMode>('transactions');
  const { ref, focused, toggleEvents, onBlurModal } = useModalFocus(props.active);

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
      <StyledCommon.InactiveToggleIndicator active={props.active} {...toggleEvents}>
        {value.transactions.length}
      </StyledCommon.InactiveToggleIndicator>
      {focused && (
        <StyledCommon.ComponentModal ref={ref} onBlur={onBlurModal}>
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
          <StyledCommon.ModalInner>
            {tabMode === 'transactions' && (
              <TabModeTransactions value={value.transactions} onChange={onChangeTransactions} />
            )}
            {tabMode === 'stockSplits' && (
              <TabModeStockSplits value={value.stockSplits} onChange={onChangeStockSplits} />
            )}
          </StyledCommon.ModalInner>
        </StyledCommon.ComponentModal>
      )}
    </Wrapper>
  );
};
