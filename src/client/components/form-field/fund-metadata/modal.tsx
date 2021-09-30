import React, { useMemo } from 'react';
import shortid from 'shortid';

import { FormFieldCost } from '../cost';
import { FormFieldDate } from '../date';
import * as StyledCommon from '../metadata/styles';
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
    <StyledCommon.ComponentListItem
      data-testid={create ? 'stock-split-create-input' : 'stock-split-edit-input'}
    >
      <StyledCommon.ComponentFields>
        <Styled.StockSplitRowDate>
          <Styled.TransactionLabel>
            <label htmlFor={`date-${id}`}>Date:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldDate id={`date-${id}`} value={date} onChange={onChangeDate} />
          </StyledCommon.ComponentCol>
        </Styled.StockSplitRowDate>
        <Styled.StockSplitRowRatio>
          <Styled.TransactionLabel>
            <label htmlFor={`ratio-${id}`}>Ratio:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldNumber id={`ratio-${id}`} value={ratio} onChange={onChangeRatio} />
          </StyledCommon.ComponentCol>
        </Styled.StockSplitRowRatio>
      </StyledCommon.ComponentFields>
      {children}
    </StyledCommon.ComponentListItem>
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
      <StyledCommon.ComponentList>
        <FormFieldStockSplit item={newItem} onChange={onChangeAddField} create>
          <StyledCommon.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </StyledCommon.ComponentRowButton>
        </FormFieldStockSplit>
        {items.map((item, index) => (
          <FormFieldStockSplit
            key={getComponentKey(item, index)}
            item={item}
            index={index}
            onChange={onUpdate}
          >
            <StyledCommon.ComponentRowButton>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </StyledCommon.ComponentRowButton>
          </FormFieldStockSplit>
        ))}
      </StyledCommon.ComponentList>
    </Wrapper>
  );
};

const FormFieldTransaction: React.FC<PropsFormFieldTransaction> = ({
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

  const id = useMemo(() => shortid.generate(), []);

  return (
    <StyledCommon.ComponentListItem
      data-testid={create ? 'transaction-create-input' : 'transaction-edit-input'}
      isDrip={props.item.drip}
    >
      <StyledCommon.ComponentFields>
        <Styled.TransactionRowDate>
          <Styled.TransactionLabel>
            <label htmlFor={`date-${id}`}>Date:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldDate id={`date-${id}`} value={date} onChange={onChangeDate} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowDate>
        <Styled.TransactionRowUnits>
          <Styled.TransactionLabel>
            <label htmlFor={`units-${id}`}>Units:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldNumber id={`units-${id}`} value={units} onChange={onChangeUnits} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowUnits>
        <Styled.TransactionRowPrice>
          <Styled.TransactionLabel>
            <label htmlFor={`price-${id}`}>Price:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldNumber id={`price-${id}`} value={price} onChange={onChangePrice} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowPrice>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`fees-${id}`}>Fees:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldCost id={`fees-${id}`} value={fees} onChange={onChangeFees} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowSmall>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`taxes-${id}`}>Taxes:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldCost id={`taxes-${id}`} value={taxes} onChange={onChangeTaxes} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowSmall>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`drip-${id}`}>DRIP:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldTickbox id={`drip-${id}`} value={drip} onChange={onChangeDrip} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowSmall>
        <Styled.TransactionRowSmall>
          <Styled.TransactionLabel>
            <label htmlFor={`pension-${id}`}>Pension:</label>
          </Styled.TransactionLabel>
          <StyledCommon.ComponentCol>
            <FormFieldTickbox id={`pension-${id}`} value={pension} onChange={onChangePension} />
          </StyledCommon.ComponentCol>
        </Styled.TransactionRowSmall>
      </StyledCommon.ComponentFields>
      {children}
    </StyledCommon.ComponentListItem>
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
      <StyledCommon.ComponentList>
        <FormFieldTransaction item={newItem} onChange={onChangeAddField} create>
          <StyledCommon.ComponentRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </StyledCommon.ComponentRowButton>
        </FormFieldTransaction>
        {items.map((item, index) => (
          <FormFieldTransaction
            key={getComponentKey(item, index)}
            item={item}
            index={index}
            onChange={onUpdate}
          >
            <StyledCommon.ComponentRowButton>
              <ButtonDelete onClick={(): void => onDelete(index)}>&minus;</ButtonDelete>
            </StyledCommon.ComponentRowButton>
          </FormFieldTransaction>
        ))}
      </StyledCommon.ComponentList>
    </Wrapper>
  );
};
