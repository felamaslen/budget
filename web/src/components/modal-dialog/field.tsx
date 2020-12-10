import React, { useCallback } from 'react';

import * as Styled from './styles';
import { FieldComponent, FormFieldTransactions } from '~client/components/form-field';
import { TransactionNative as Transaction, FieldKey, ListItemInput } from '~client/types';

export type FieldWrapper<V = never> = React.FC<{
  id: string;
  invalid?: boolean;
  value: V;
  onChange: (value: V) => void;
}>;

export function makeField<V = never>(
  field: string,
  Field: FieldComponent<V>,
  label = field,
): FieldWrapper<V> {
  const WrappedField: FieldWrapper<V> = ({ id, invalid, value, onChange }) => (
    <>
      <Styled.FormLabel item={field as string}>
        <label htmlFor={id}>{label}</label>
      </Styled.FormLabel>
      <Field invalid={invalid} value={value} onChange={onChange} />
    </>
  );

  return WrappedField;
}

export const FieldTransactions: FieldWrapper<Transaction[]> = ({ invalid, value, onChange }) => (
  <Styled.FormRowInner>
    <Styled.FormLabel item="transactions">transactions</Styled.FormLabel>
    <FormFieldTransactions invalid={invalid} value={value} onChange={onChange} />
  </Styled.FormRowInner>
);

export type ModalFields<I extends ListItemInput> = {
  [K in FieldKey<I>]: FieldWrapper<Exclude<I[K], null | undefined>>;
};

type PropsModalField<V> = {
  id: string;
  Field: FieldWrapper<Exclude<V, null | undefined>>;
  field: string | number | symbol;
  value: V;
  onChange: (field: string, value: V) => void;
  invalid: boolean;
};

export function ModalDialogField<V = never>({
  id,
  Field,
  field,
  value,
  onChange,
  invalid,
}: PropsModalField<V>): React.ReactElement<PropsModalField<V>> {
  const onChangeCallback = useCallback((newValue: V) => onChange(field as string, newValue), [
    onChange,
    field,
  ]);

  return (
    <Styled.FormRow field={field as string}>
      <Field
        id={id}
        value={value as Exclude<V, null | undefined>}
        onChange={onChangeCallback}
        invalid={invalid}
      />
    </Styled.FormRow>
  );
}
