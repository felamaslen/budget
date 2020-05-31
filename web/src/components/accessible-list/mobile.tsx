import React, { useState, useCallback } from 'react';

import * as Styled from './styles';
import { FieldsMobile, ComponentType } from './types';
import { OnCreateList } from '~client/actions/list';
import { FormFieldText } from '~client/components/FormField';
import { FormFieldCost } from '~client/components/FormField/cost';
import { FormFieldDate } from '~client/components/FormField/date';
import ModalDialog, { ModalFields, makeField } from '~client/components/ModalDialog';
import { useCTA } from '~client/hooks/cta';
import { formatItem } from '~client/modules/format';
import { Button } from '~client/styled/shared';
import { Item, ListCalcItem } from '~client/types';

export type DefaultMobileKeys = 'date' | 'item' | 'cost';

type StandardFieldPropsMobile<V, E extends {} = {}> = Partial<E> & {
  field: string;
  value: V;
};

export const StandardFieldMobile = <V, E extends {} = {}>({
  field,
  value,
}: StandardFieldPropsMobile<V, E>): React.ReactElement<StandardFieldPropsMobile<V, E>> => (
  <Styled.StandardFieldMobile field={field}>
    {formatItem(field as string, value)}
  </Styled.StandardFieldMobile>
);

export const standardFieldsMobile: FieldsMobile<ListCalcItem, DefaultMobileKeys> = {
  date: StandardFieldMobile,
  item: StandardFieldMobile,
  cost: StandardFieldMobile,
};

export const standardModalFields: ModalFields<ListCalcItem> = {
  date: makeField('date', FormFieldDate),
  item: makeField('item', FormFieldText),
  cost: makeField('cost', FormFieldCost),
};

export type FieldPropsMobile<I extends Item, F extends keyof I, E extends {}> = {
  fieldsMobile: FieldsMobile<I, F, E>;
  field: F;
  item: I;
  extraProps?: Partial<E>;
};

export const ListFieldMobile = <I extends Item, F extends keyof I, E extends {}>({
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

type PropsCreateForm<I extends Item, P extends string> = {
  page: P;
  color?: string;
  fields?: ModalFields<I>;
  onCreate: OnCreateList<I, P, void>;
};

export const MobileCreateForm = <I extends Item, P extends string>({
  color,
  fields,
  onCreate,
}: PropsCreateForm<I, P>): React.ReactElement<PropsCreateForm<I, P>> => {
  const [modalActive, setModalActive] = useState<boolean>(false);
  const onCancel = useCallback(() => setModalActive(false), []);
  const activateModal = useCallback(() => setModalActive(true), []);

  const onSubmit = useCallback(
    (newItem: I): void => {
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
