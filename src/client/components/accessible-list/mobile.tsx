import React, { useState, useCallback } from 'react';

import * as Styled from './styles';
import type { FieldsMobile, ComponentType } from './types';
import { ModalDialog, ModalFields } from '~client/components/modal-dialog';
import { useCTA } from '~client/hooks';
import { Button } from '~client/styled/shared';
import type { Id, PageList } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

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
