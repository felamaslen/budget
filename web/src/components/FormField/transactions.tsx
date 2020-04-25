import React, { useState, useCallback } from 'react';
import { DateTime } from 'luxon';
import format from 'date-fns/format';

import {
  LegacyTransaction as Transaction,
  Transaction as NewTransaction,
} from '~client/types/funds';
import { useField } from '~client/hooks/field';
import { Button } from '~client/styled/shared/button';
import { Wrapper, WrapperProps } from '.';
import FormFieldDate from '~client/components/FormField/date';
import FormFieldNumber from '~client/components/FormField/number';
import FormFieldCost from '~client/components/FormField/cost';
import { addToTransactionsList, modifyTransactionById } from '~client/modules/data';
import { CREATE_ID } from '~client/constants/data';

import * as Styled from './styles';

type PropsTransaction = {
  item: Transaction | NewTransaction;
  // TODO: make this a delta: Partial<Transaction>
  onChange: (id: string, column: 'date' | 'units' | 'cost', value: string | number) => void;
  active?: boolean;
  create?: boolean;
};

const FormFieldTransaction: React.FC<PropsTransaction> = ({
  item,
  children,
  onChange,
  active,
  create,
}) => {
  const onChangeDate = useCallback(
    (value: Date | DateTime) => {
      // TODO: pass value as a Date here
      const date = value instanceof Date ? format(value, 'yyyy-MM-dd') : value.toISODate();
      onChange(item.id, 'date', date);
    },
    [onChange, item.id],
  );
  const onChangeUnits = useCallback((value = 0) => onChange(item.id, 'units', value), [
    onChange,
    item.id,
  ]);
  const onChangeCost = useCallback((value = 0) => onChange(item.id, 'cost', value), [
    onChange,
    item.id,
  ]);

  return (
    <Styled.TransactionsListItem data-testid={create ? 'create-input' : 'edit-input'}>
      <Styled.TransactionRowDate>
        <Styled.TransactionLabel>{'Date:'}</Styled.TransactionLabel>
        <Styled.TransactionCol>
          <FormFieldDate value={item.date} onChange={onChangeDate} active={active} />
        </Styled.TransactionCol>
      </Styled.TransactionRowDate>
      <Styled.TransactionRowUnits>
        <Styled.TransactionLabel>{'Units:'}</Styled.TransactionLabel>
        <Styled.TransactionCol>
          <FormFieldNumber value={item.units} onChange={onChangeUnits} active={active} />
        </Styled.TransactionCol>
      </Styled.TransactionRowUnits>
      <Styled.TransactionRowCost>
        <Styled.TransactionLabel>{'Cost:'}</Styled.TransactionLabel>
        <Styled.TransactionCol>
          <FormFieldCost value={item.cost} onChange={onChangeCost} active={active} />
        </Styled.TransactionCol>
      </Styled.TransactionRowCost>
      {children}
    </Styled.TransactionsListItem>
  );
};

const newItemInit: NewTransaction = {
  id: CREATE_ID,
  date: new Date(),
  units: 0,
  cost: 0,
};

export type Props = WrapperProps<Transaction[] | undefined> & {
  onChange: (value: Transaction[]) => void;
  create?: boolean;
};

const FormFieldTransactions: React.FC<Props> = ({
  create = false,
  invalid = false,
  value = [],
  ...props
}) => {
  const [currentValue, , onChangeInput] = useField<Transaction[]>({
    ...props,
    inline: true,
    value,
  });

  const onChange = useCallback(
    (newValue: Transaction[]): void =>
      onChangeInput(({
        target: { value: newValue },
      } as unknown) as React.ChangeEvent<HTMLInputElement>),
    [onChangeInput],
  );

  const { active } = props;

  const onChangeTransaction = useCallback(
    (id, field, fieldValue) =>
      onChange(
        modifyTransactionById(value, id, {
          [field]: fieldValue,
        }),
      ),
    [value, onChange],
  );

  const onRemoveTransaction = useCallback(
    id => onChange(currentValue.filter(({ id: valueId }) => valueId !== id)),
    [currentValue, onChange],
  );

  const [newItem, setNewItem] = useState<NewTransaction>(newItemInit);

  const onChangeAddField = useCallback(
    // TODO: use delta: Partial<Transaction>
    (_, field: 'date' | 'units' | 'cost', fieldValue: string | number) => {
      setNewItem(
        (last: NewTransaction): NewTransaction => {
          const result = {
            ...last,
            [field]: field === 'date' ? new Date(fieldValue) : fieldValue,
          };
          return result;
        },
      );
    },
    [],
  );

  const onAdd = useCallback(() => {
    if (!newItem) {
      return;
    }

    setNewItem(newItemInit);
    onChange(
      addToTransactionsList(currentValue, {
        // TODO: remove this hack
        ...newItem,
        date: format(newItem.date, 'yyyy-MM-dd'),
      }),
    );
  }, [newItem, currentValue, onChange]);

  return (
    <Wrapper item="transactions" value={value} active invalid={invalid}>
      <Styled.NumTransactions active={active}>{(value || []).length}</Styled.NumTransactions>
      {currentValue && active && (
        <Styled.TransactionsModal>
          <Styled.ModalInner>
            {create && (
              <Styled.ModalHead>
                <Styled.ModalHeadDate>{'Date'}</Styled.ModalHeadDate>
                <Styled.ModalHeadUnits>{'Units'}</Styled.ModalHeadUnits>
                <Styled.ModalHeadCost>{'Cost'}</Styled.ModalHeadCost>
              </Styled.ModalHead>
            )}
            <Styled.TransactionsList>
              {create && (
                <FormFieldTransaction item={newItem} onChange={onChangeAddField} create>
                  <Styled.TransactionRowButton>
                    <Button onClick={onAdd}>{'+'}</Button>
                  </Styled.TransactionRowButton>
                </FormFieldTransaction>
              )}
              {currentValue.map(item => (
                <FormFieldTransaction
                  key={item.id}
                  item={item}
                  active={active}
                  onChange={onChangeTransaction}
                >
                  {create && (
                    <span>
                      <Button onClick={(): void => onRemoveTransaction(item.id)}>&minus;</Button>
                    </span>
                  )}
                </FormFieldTransaction>
              ))}
            </Styled.TransactionsList>
          </Styled.ModalInner>
        </Styled.TransactionsModal>
      )}
    </Wrapper>
  );
};

export default FormFieldTransactions;
