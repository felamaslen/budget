import React, { useState, useCallback } from 'react';

import * as Styled from './styles';
import { FieldsMobile, ComponentType } from './types';
import { FormFieldText, FormFieldCost, FormFieldDate } from '~client/components/form-field';
import { ModalDialog, ModalFields, makeField } from '~client/components/modal-dialog';
import { useCTA } from '~client/hooks';
import { formatItem } from '~client/modules/format';
import { Button } from '~client/styled/shared';
import { Id, ListItemInput, ListItemStandard, PageList, StandardInput } from '~client/types';

export type DefaultMobileKeys = 'date' | 'item' | 'cost';

type StandardFieldPropsMobile<
  V,
  E extends Record<string, unknown> = Record<string, unknown>
> = Partial<E> & {
  field: string;
  value: V;
};

const StandardFieldMobile = <V, E extends Record<string, unknown> = Record<string, unknown>>({
  field,
  value,
}: StandardFieldPropsMobile<V, E>): React.ReactElement<StandardFieldPropsMobile<V, E>> => (
  <Styled.StandardFieldMobile field={field}>
    {formatItem(field as string, value)}
  </Styled.StandardFieldMobile>
);

export const standardFieldsMobile: FieldsMobile<ListItemStandard, DefaultMobileKeys> = {
  date: StandardFieldMobile,
  item: StandardFieldMobile,
  cost: StandardFieldMobile,
};

export const standardModalFields: ModalFields<StandardInput> = {
  date: makeField('date', FormFieldDate),
  item: makeField('item', FormFieldText),
  cost: makeField('cost', FormFieldCost),
};

type FieldPropsMobile<
  I extends ListItemInput,
  F extends keyof I,
  E extends Record<string, unknown> = never
> = {
  fieldsMobile: FieldsMobile<I, F, E>;
  field: F;
  item: I;
  extraProps?: Partial<E>;
};

export const ListFieldMobile = <
  I extends ListItemInput,
  F extends keyof I,
  E extends Record<string, unknown>
>({
  fieldsMobile,
  field,
  item,
  extraProps = {},
}: FieldPropsMobile<I, F, E>): null | React.ReactElement<FieldPropsMobile<I, F, E>> => {
  const Field: undefined | ComponentType<{ field: F; value: I[F] } & Partial<E>> =
    fieldsMobile?.[field];

  if (!Field) {
    return null;
  }

  return <Field field={field} value={item[field]} {...extraProps} />;
};

type PropsCreateForm<I extends ListItemInput, P extends PageList> = {
  page: P;
  color?: string;
  fields?: ModalFields<I>;
  onCreate: (item: I) => void;
};

export const MobileCreateForm = <I extends ListItemInput, P extends PageList>({
  color,
  fields,
  onCreate,
}: PropsCreateForm<I, P>): React.ReactElement<PropsCreateForm<I, P>> => {
  const [modalActive, setModalActive] = useState<boolean>(false);
  const onCancel = useCallback(() => setModalActive(false), []);
  const activateModal = useCallback(() => setModalActive(true), []);

  const onSubmit = useCallback(
    (_: Id | undefined, newItem: I): void => {
      onCreate(newItem);
      setModalActive(false);
    },
    [onCreate],
  );

  const addButtonEvents = useCTA(activateModal);

  return (
    <>
      <ModalDialog<I>
        active={modalActive}
        type="add"
        fields={fields}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
      <Styled.MobileCreateForm bgColor={color}>
        <Button {...addButtonEvents}>Add</Button>
      </Styled.MobileCreateForm>
    </>
  );
};
