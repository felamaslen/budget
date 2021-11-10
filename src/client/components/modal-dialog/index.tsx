import { ModalDialogField } from './field';
import { emptyFields, useModalState, useModalSubmit } from './hooks';
import * as Styled from './styles';
import type { ModalFields, Props } from './types';

import { CREATE_ID } from '~client/constants/data';
import { Button, ButtonSubmit, ButtonCancel } from '~client/styled/shared';
import type { FieldKey } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

export { makeField } from './field';
export type { ModalFields, FieldWrapper } from './types';

export const ModalDialog = <I extends ListItemInput>(
  props: Props<I>,
): null | React.ReactElement => {
  const {
    active,
    fields = emptyFields as ModalFields<I>,
    loading = false,
    id = CREATE_ID,
    onCancel,
    onRemove,
  } = props;

  const { canRemove, title, visible } = useModalState(props);
  const { tempFields, invalid, onChangeField, onSubmitCallback } = useModalSubmit(props);

  if (!visible) {
    return null;
  }

  return (
    <Styled.ModalDialog data-testid="modal-dialog">
      <Styled.ModalInner active={active} isLoading={loading}>
        <Styled.Title>{title}</Styled.Title>
        <Styled.FormList data-testid="form-list">
          {(Object.keys(fields) as FieldKey<I>[]).map((field: FieldKey<I>) => (
            <ModalDialogField
              key={field as string}
              id={`${id}-${field}`}
              field={field}
              Field={fields[field]}
              value={tempFields[field]}
              invalid={invalid.includes(field as FieldKey<I>)}
              onChange={onChangeField}
            />
          ))}
        </Styled.FormList>
        <Styled.Buttons>
          <ButtonCancel type="button" disabled={loading} onClick={onCancel}>
            nope.avi
          </ButtonCancel>
          <ButtonSubmit type="button" disabled={loading} onClick={onSubmitCallback}>
            Do it.
          </ButtonSubmit>
          {canRemove && (
            <Button type="button" disabled={loading} onClick={onRemove}>
              &minus;
            </Button>
          )}
        </Styled.Buttons>
      </Styled.ModalInner>
    </Styled.ModalDialog>
  );
};
