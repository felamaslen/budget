import React, { useEffect, useState, useCallback } from 'react';

import { Transaction } from '~client/types/funds';
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
  item: Transaction;
  onChange: (id: string, delta: Partial<Transaction>) => void;
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
  const [delta, setDelta] = useState<Partial<Transaction>>({});
  useEffect(() => {
    if (Object.keys(delta).length) {
      onChange(item.id, delta);
    }
  }, [delta, onChange, item.id]);
  const onChangeDate = useCallback((date?: Date) => setDelta(last => ({ ...last, date })), []);
  const onChangeUnits = useCallback((units?: number) => setDelta(last => ({ ...last, units })), []);
  const onChangeCost = useCallback((cost?: number) => setDelta(last => ({ ...last, cost })), []);

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

const newItemInit: Transaction = {
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
    (id: string, delta: Partial<Transaction>): void =>
      onChange(modifyTransactionById(value, id, delta)),
    [value, onChange],
  );

  const onRemoveTransaction = useCallback(
    id => onChange(currentValue.filter(({ id: valueId }) => valueId !== id)),
    [currentValue, onChange],
  );

  const [newItem, setNewItem] = useState<Transaction>(newItemInit);

  const onChangeAddField = useCallback((_, delta: Partial<Transaction>): void => {
    setNewItem(last => ({ ...last, ...delta }));
  }, []);

  const onAdd = useCallback(() => {
    if (!(newItem.units && newItem.cost)) {
      return;
    }

    setNewItem(newItemInit);
    onChange(addToTransactionsList(currentValue, newItem));
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
