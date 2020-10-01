import React, { useEffect, useState, useCallback, useRef } from 'react';

import { FormFieldCost, FormFieldCostInline } from './cost';
import { FormFieldDate, FormFieldDateInline } from './date';
import { FormFieldNumber, FormFieldNumberInline } from './number';
import { Wrapper, WrapperProps } from './shared';
import * as Styled from './styles';
import { CREATE_ID } from '~client/constants/data';
import { useCTA } from '~client/hooks';
import { useField } from '~client/hooks/field';
import { addToTransactionsList, modifyTransactionById, sortByKey } from '~client/modules/data';
import { FlexColumn, ButtonAdd, ButtonDelete } from '~client/styled/shared';
import { Id, Transaction } from '~client/types';

type PropsTransaction = {
  id?: Id;
  item: Transaction;
  onChange: (id: Id, delta: Partial<Transaction>) => void;
  create?: boolean;
};

function useSingleTransactionField({
  item,
  onChange,
}: Omit<PropsTransaction, 'create'>): {
  onChangeDate: (value: Date | undefined) => void;
  onChangeUnits: (value: number | undefined) => void;
  onChangePrice: (value: number | undefined) => void;
  onChangeFees: (value: number | undefined) => void;
  onChangeTaxes: (value: number | undefined) => void;
} {
  const [delta, setDelta] = useState<Partial<Transaction>>({});
  const prevDelta = useRef<Partial<Transaction>>(delta);
  useEffect(() => {
    if (delta !== prevDelta.current && Object.keys(delta).length) {
      prevDelta.current = delta;
      onChange(item.id, delta);
    }
  }, [delta, onChange, item.id]);
  const onChangeDate = useCallback((date?: Date) => setDelta((last) => ({ ...last, date })), []);
  const onChangeUnits = useCallback(
    (units?: number) => setDelta((last) => ({ ...last, units })),
    [],
  );
  const onChangePrice = useCallback(
    (price?: number) => setDelta((last) => ({ ...last, price })),
    [],
  );
  const onChangeFees = useCallback((fees?: number) => setDelta((last) => ({ ...last, fees })), []);
  const onChangeTaxes = useCallback(
    (taxes?: number) => setDelta((last) => ({ ...last, taxes })),
    [],
  );

  return { onChangeDate, onChangeUnits, onChangePrice, onChangeFees, onChangeTaxes };
}

const FormFieldTransactionInline: React.FC<PropsTransaction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { id, date, units, price, fees, taxes },
  } = props;
  const {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
  } = useSingleTransactionField(props);

  return (
    <Styled.TransactionsListItem data-testid={create ? 'create-input' : 'edit-input'}>
      <Styled.TransactionRowDate>
        <FormFieldDateInline id={`date-${id}`} value={date} onChange={onChangeDate} />
      </Styled.TransactionRowDate>
      <FlexColumn>
        <Styled.UnitsPriceRow>
          <Styled.TransactionRowUnits>
            <FormFieldNumberInline
              id={`units-${id}`}
              allowEmpty
              value={units}
              onChange={onChangeUnits}
            />
          </Styled.TransactionRowUnits>
          <Styled.TransactionRowPrice>
            <FormFieldNumberInline
              id={`price-${id}`}
              allowEmpty
              value={price}
              onChange={onChangePrice}
            />
          </Styled.TransactionRowPrice>
        </Styled.UnitsPriceRow>
        <Styled.TransactionRowFees>
          <Styled.FeesLabel>Fees</Styled.FeesLabel>
          <FormFieldCostInline id={`fees-${id}`} allowEmpty value={fees} onChange={onChangeFees} />
          <Styled.FeesLabel>Taxes</Styled.FeesLabel>
          <FormFieldCostInline
            id={`taxes-${id}`}
            allowEmpty
            value={taxes}
            onChange={onChangeTaxes}
          />
        </Styled.TransactionRowFees>
      </FlexColumn>
      {children}
    </Styled.TransactionsListItem>
  );
};

const FormFieldTransaction: React.FC<PropsTransaction> = ({
  children,
  create = false,
  ...props
}) => {
  const {
    item: { id, date, units, price, fees, taxes },
  } = props;
  const {
    onChangeDate,
    onChangeUnits,
    onChangePrice,
    onChangeFees,
    onChangeTaxes,
  } = useSingleTransactionField(props);

  return (
    <Styled.TransactionsListItem data-testid={create ? 'create-input' : 'edit-input'}>
      <Styled.TransactionFields>
        <Styled.TransactionRowDate>
          <Styled.TransactionLabel>
            <label htmlFor={`date-${id}`}>Date:</label>
          </Styled.TransactionLabel>
          <Styled.TransactionCol>
            <FormFieldDate id={`date-${id}`} value={date} onChange={onChangeDate} />
          </Styled.TransactionCol>
        </Styled.TransactionRowDate>
        <Styled.TransactionRowUnits>
          <Styled.TransactionLabel>
            <label htmlFor={`units-${id}`}>Units:</label>
          </Styled.TransactionLabel>
          <Styled.TransactionCol>
            <FormFieldNumber id={`units-${id}`} value={units} onChange={onChangeUnits} />
          </Styled.TransactionCol>
        </Styled.TransactionRowUnits>
        <Styled.TransactionRowPrice>
          <Styled.TransactionLabel>
            <label htmlFor={`price-${id}`}>Price:</label>
          </Styled.TransactionLabel>
          <Styled.TransactionCol>
            <FormFieldNumber id={`price-${id}`} value={price} onChange={onChangePrice} />
          </Styled.TransactionCol>
        </Styled.TransactionRowPrice>
        <Styled.TransactionRowFees>
          <Styled.TransactionLabel>
            <label htmlFor={`fees-${id}`}>Fees:</label>
          </Styled.TransactionLabel>
          <Styled.TransactionCol>
            <FormFieldCost id={`fees-${id}`} value={fees} onChange={onChangeFees} />
          </Styled.TransactionCol>
        </Styled.TransactionRowFees>
        <Styled.TransactionRowFees>
          <Styled.TransactionLabel>
            <label htmlFor={`taxes-${id}`}>Taxes:</label>
          </Styled.TransactionLabel>
          <Styled.TransactionCol>
            <FormFieldCost id={`taxes-${id}`} value={taxes} onChange={onChangeTaxes} />
          </Styled.TransactionCol>
        </Styled.TransactionRowFees>
      </Styled.TransactionFields>
      {children}
    </Styled.TransactionsListItem>
  );
};

const newItemInit: Transaction = {
  id: CREATE_ID,
  date: new Date(),
  units: 0,
  price: 0,
  fees: 0,
  taxes: 0,
};

const emptyValue: Transaction[] = [];

const sortTransactions = sortByKey<'date', Transaction>({ key: 'date', order: -1 });

type HookProps = {
  value: Transaction[];
  onChange: (value: Transaction[]) => void;
};

function useTransactionsField(
  props: HookProps,
): {
  currentValue: Transaction[];
  newItem: Transaction;
  onCreate: () => void;
  onUpdate: (id: Id, delta: Partial<Transaction>) => void;
  onDelete: (id: Id) => void;
  onChangeAddField: (id: Id, delta: Partial<Transaction>) => void;
} {
  const { currentValue, onChange } = useField<Transaction[], Transaction[]>({
    ...props,
    inline: true,
    immediate: true,
  });

  const onChangeTransaction = useCallback(
    (id: Id, delta: Partial<Transaction>): void => {
      onChange(modifyTransactionById(props.value, id, delta));
    },
    [props.value, onChange],
  );

  const onRemoveTransaction = useCallback(
    (id) => onChange(currentValue.filter(({ id: valueId }) => valueId !== id)),
    [currentValue, onChange],
  );

  const [newItem, setNewItem] = useState<Transaction>(newItemInit);

  const onChangeAddField = useCallback((_, delta: Partial<Transaction>): void => {
    setNewItem((last) => ({ ...last, ...delta }));
  }, []);

  const onAdd = useCallback(() => {
    if (!(newItem.units && newItem.price)) {
      return;
    }

    setNewItem(newItemInit);
    onChange(addToTransactionsList(currentValue, newItem));
  }, [newItem, currentValue, onChange]);

  return {
    currentValue,
    newItem,
    onCreate: onAdd,
    onUpdate: onChangeTransaction,
    onDelete: onRemoveTransaction,
    onChangeAddField,
  };
}

type PropsInline = WrapperProps & {
  value: Transaction[] | undefined;
  onChange: (value: Transaction[]) => void;
};

export const FormFieldTransactionsInline: React.FC<PropsInline> = ({
  value = emptyValue,
  ...props
}) => {
  const {
    currentValue,
    newItem,
    onChangeAddField,
    onCreate,
    onUpdate,
    onDelete,
  } = useTransactionsField({
    ...props,
    value,
  });

  const [focused, setFocused] = useState<boolean>(!!props.active);
  const modalRef = useRef<HTMLDivElement>(null);
  const onToggleModal = useCallback(() => setFocused((last) => !last), []);
  const onBlurModal = useCallback((): void => {
    setImmediate(() => {
      if (!modalRef.current?.contains(document.activeElement)) {
        setFocused(false);
      }
    });
  }, []);
  useEffect(() => {
    setFocused(!!props.active);
  }, [props.active]);

  const toggleEvents = useCTA(onToggleModal);

  return (
    <Wrapper item="transactions">
      <Styled.NumTransactions active={props.active} {...toggleEvents}>
        {value.length}
      </Styled.NumTransactions>
      {focused && (
        <Styled.TransactionsModal ref={modalRef} onBlur={onBlurModal}>
          <Styled.ModalInner>
            <Styled.ModalHead>
              <Styled.ModalHeadDate>Date</Styled.ModalHeadDate>
              <Styled.ModalHeadUnits>Units</Styled.ModalHeadUnits>
              <Styled.ModalHeadPrice>Price</Styled.ModalHeadPrice>
            </Styled.ModalHead>
            <Styled.TransactionsList>
              <FormFieldTransactionInline item={newItem} onChange={onChangeAddField} create>
                <Styled.TransactionRowButton>
                  <ButtonAdd onClick={onCreate}>+</ButtonAdd>
                </Styled.TransactionRowButton>
              </FormFieldTransactionInline>
              {sortTransactions(currentValue).map((item) => (
                <FormFieldTransactionInline
                  key={item.id}
                  id={item.id}
                  item={item}
                  onChange={onUpdate}
                >
                  <span>
                    <ButtonDelete onClick={(): void => onDelete(item.id)}>&minus;</ButtonDelete>
                  </span>
                </FormFieldTransactionInline>
              ))}
            </Styled.TransactionsList>
          </Styled.ModalInner>
        </Styled.TransactionsModal>
      )}
    </Wrapper>
  );
};

type Props = WrapperProps & {
  value: Transaction[];
  onChange: (value: Transaction[]) => void;
};

export const FormFieldTransactions: React.FC<Props> = ({ invalid = false, ...props }) => {
  const {
    currentValue,
    newItem,
    onChangeAddField,
    onCreate,
    onUpdate,
    onDelete,
  } = useTransactionsField(props);

  return (
    <Wrapper item="transactions" invalid={invalid}>
      <Styled.TransactionsList>
        <FormFieldTransaction item={newItem} onChange={onChangeAddField} create>
          <Styled.TransactionRowButton>
            <ButtonAdd onClick={onCreate}>+</ButtonAdd>
          </Styled.TransactionRowButton>
        </FormFieldTransaction>
        {sortTransactions(currentValue).map((item) => (
          <FormFieldTransaction key={item.id} id={item.id} item={item} onChange={onUpdate}>
            <Styled.TransactionRowButton>
              <ButtonDelete onClick={(): void => onDelete(item.id)}>&minus;</ButtonDelete>
            </Styled.TransactionRowButton>
          </FormFieldTransaction>
        ))}
      </Styled.TransactionsList>
    </Wrapper>
  );
};
