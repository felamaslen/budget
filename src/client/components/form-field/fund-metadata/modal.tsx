import React, { useMemo } from 'react';
import shortid from 'shortid';

import { FormFieldCost } from '../cost';
import { FormFieldDate } from '../date';
import { FormFieldNumber } from '../number';
import { Wrapper } from '../shared';
import { FormFieldTickbox } from '../tickbox';

import * as Styled from './styles';
import type {
  PropsFormFieldModalStockSplits,
  PropsFormFieldModalTransactions,
  PropsFormFieldStockSplit,
  PropsFormFieldTransaction,
} from './types';
import { useSingleStockSplitField, useStockSplitsField } from './use-stock-splits-field';
import { useSingleTransactionField, useTransactionsField } from './use-transactions-field';
import { getComponentKey } from './utils';

import { ButtonAdd, ButtonDelete } from '~client/styled/shared';

const FormFieldStockSplit: React.FC<PropsFormFieldStockSplit> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { date, ratio },
  } = props;
  const { onChangeDate, onChangeRatio } = useSingleStockSplitField(props.onChange, props.index);

  const id = useMemo(() => shortid.generate(), []);

  return (
    <Styled.ComponentListItem
      data-testid={create ? 'stock-split-create-input' : 'stock-split-edit-input'}
    >
      <Styled.ComponentFields>
        <Styled.StockSplitRowDate>
          <Styled.TransactionLabel>
            <label htmlFor={`date-${id}`}>Date:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldDate id={`date-${id}`} value={date} onChange={onChangeDate} />
          </Styled.ComponentCol>
        </Styled.StockSplitRowDate>
        <Styled.StockSplitRowRatio>
          <Styled.TransactionLabel>
            <label htmlFor={`ratio-${id}`}>Ratio:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldNumber id={`ratio-${id}`} value={ratio} onChange={onChangeRatio} />
          </Styled.ComponentCol>
        </Styled.StockSplitRowRatio>
      </Styled.ComponentFields>
      {children}
    </Styled.ComponentListItem>
  );
};
export const FormFieldStockSplits: React.FC<PropsFormFieldModalStockSplits> = ({
  invalid = false,
  ...props
}) => {
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useStockSplitsField(
    props,
  );

  return (
    <Wrapper item="stockSplits" invalid={invalid}>
      <Styled.ComponentList>
        <FormFieldStockSplit item={newItem} onChange={onChangeAddField} create>
          <Styled.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </Styled.ComponentRowButton>
        </FormFieldStockSplit>
        {items.map((item, index) => (
          <FormFieldStockSplit
            key={getComponentKey(item, index)}
            item={item}
            index={index}
            onChange={onUpdate}
          >
            <Styled.ComponentRowButton>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </Styled.ComponentRowButton>
          </FormFieldStockSplit>
        ))}
      </Styled.ComponentList>
    </Wrapper>
  );
};

const FormFieldTransaction: React.FC<PropsFormFieldTransaction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { date, units, price, fees, taxes, drip },
  } = props;
  const {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
    onChangeDrip,
  } = useSingleTransactionField(props.onChange, props.index);

  const id = useMemo(() => shortid.generate(), []);

  return (
    <Styled.ComponentListItem
      data-testid={create ? 'transaction-create-input' : 'transaction-edit-input'}
      isDrip={props.item.drip}
    >
      <Styled.ComponentFields>
        <Styled.TransactionRowDate>
          <Styled.TransactionLabel>
            <label htmlFor={`date-${id}`}>Date:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldDate id={`date-${id}`} value={date} onChange={onChangeDate} />
          </Styled.ComponentCol>
        </Styled.TransactionRowDate>
        <Styled.TransactionRowUnits>
          <Styled.TransactionLabel>
            <label htmlFor={`units-${id}`}>Units:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldNumber id={`units-${id}`} value={units} onChange={onChangeUnits} />
          </Styled.ComponentCol>
        </Styled.TransactionRowUnits>
        <Styled.TransactionRowPrice>
          <Styled.TransactionLabel>
            <label htmlFor={`price-${id}`}>Price:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldNumber id={`price-${id}`} value={price} onChange={onChangePrice} />
          </Styled.ComponentCol>
        </Styled.TransactionRowPrice>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`fees-${id}`}>Fees:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldCost id={`fees-${id}`} value={fees} onChange={onChangeFees} />
          </Styled.ComponentCol>
        </Styled.TransactionRowSmall>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`taxes-${id}`}>Taxes:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldCost id={`taxes-${id}`} value={taxes} onChange={onChangeTaxes} />
          </Styled.ComponentCol>
        </Styled.TransactionRowSmall>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`drip-${id}`}>DRIP:</label>
          </Styled.TransactionLabel>
          <Styled.ComponentCol>
            <FormFieldTickbox id={`drip-${id}`} value={drip} onChange={onChangeDrip} />
          </Styled.ComponentCol>
        </Styled.TransactionRowSmall>
      </Styled.ComponentFields>
      {children}
    </Styled.ComponentListItem>
  );
};

export const FormFieldTransactions: React.FC<PropsFormFieldModalTransactions> = ({
  invalid = false,
  ...props
}) => {
  const { items, newItem, onChangeAddField, onCreate, onUpdate, onDelete } = useTransactionsField(
    props,
  );

  return (
    <Wrapper item="transactions" invalid={invalid}>
      <Styled.ComponentList>
        <FormFieldTransaction item={newItem} onChange={onChangeAddField} create>
          <Styled.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </Styled.ComponentRowButton>
        </FormFieldTransaction>
        {items.map((item, index) => (
          <FormFieldTransaction
            key={getComponentKey(item, index)}
            item={item}
            index={index}
            onChange={onUpdate}
          >
            <Styled.ComponentRowButton>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </Styled.ComponentRowButton>
          </FormFieldTransaction>
        ))}
      </Styled.ComponentList>
    </Wrapper>
  );
};
