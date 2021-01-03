import startOfDay from 'date-fns/startOfDay';
import omit from 'lodash/omit';
import React, { useRef, useState, useReducer, useEffect, useCallback } from 'react';

import { ModalDialogField, ModalFields } from './field';
import * as Styled from './styles';

import { CREATE_ID } from '~client/constants/data';
import { Button, ButtonSubmit, ButtonCancel } from '~client/styled/shared';
import type { Delta, FieldKey, Id } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

export { makeField } from './field';
export type { ModalFields, FieldWrapper } from './field';

type DialogType = 'edit' | 'add';

type State = {
  visible: boolean;
  title: string;
  canRemove: boolean;
};

const enum ActionType {
  Hidden,
  Shown,
  ChangedId,
}

type PersistentStatePayload = {
  type: DialogType;
  id?: number;
  canRemove: boolean;
};

type ActionHidden = {
  type: ActionType.Hidden;
};

type ActionShown = {
  type: ActionType.Shown;
  payload: PersistentStatePayload;
};

type ActionChangedId = {
  type: ActionType.ChangedId;
  payload: PersistentStatePayload;
};

type Action = ActionHidden | ActionShown | ActionChangedId;

function getTitle({ type, id }: Pick<PersistentStatePayload, 'type' | 'id'>): string {
  if (type === 'edit') {
    return `Editing id#${id}`;
  }
  return 'Add item';
}

export const animationTime = 350;

function initField<I extends ListItemInput>(field: 'date', item: Delta<I>): Date;
function initField<I extends ListItemInput>(field: 'cost', item: Delta<I>): number;
function initField<I extends ListItemInput, K extends keyof I>(
  field: keyof I,
  item: Delta<I>,
): I[K];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initField<I extends ListItemInput>(field: FieldKey<I>, item: Partial<I>): any {
  if (field === 'date' && !Reflect.get(item, field)) {
    return startOfDay(new Date());
  }
  if (field === 'cost' && typeof Reflect.get(item, field) === 'undefined') {
    return 0;
  }
  return item[field] ?? '';
}

const initFields = <I extends ListItemInput>(item: Partial<I>, fields: ModalFields<I>): I =>
  (Object.keys(fields) as FieldKey<I>[]).reduce<Partial<I>>(
    (last, field) => ({
      ...last,
      [field]: initField(field, item),
    }),
    omit(item, '__typename', 'id') as Partial<I>,
  ) as I;

const updatePersistentState = (
  state: State,
  { payload }: { payload: PersistentStatePayload },
): State => ({
  ...state,
  title: getTitle(payload),
  canRemove: payload.canRemove,
});

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (state, action): State => {
  if (action.type === ActionType.Hidden) {
    return {
      ...state,
      visible: false,
    };
  }
  if (action.type === ActionType.Shown) {
    return {
      ...updatePersistentState(state, action),
      visible: true,
    };
  }
  if (action.type === ActionType.ChangedId) {
    return updatePersistentState(state, action);
  }

  return state;
};

export type Props<I extends ListItemInput> = {
  active: boolean;
  loading?: boolean;
  type?: DialogType;
  id?: Id;
  item?: Partial<I>;
  fields?: ModalFields<I>;
  onCancel: () => void;
  onSubmit: (id: Id, item: I) => void;
  onRemove?: () => void;
};

const empty = {};

export const ModalDialog = <I extends ListItemInput>({
  active,
  loading = false,
  id = CREATE_ID,
  item = empty,
  fields = empty as ModalFields<I>,
  type = 'edit',
  onCancel,
  onSubmit,
  onRemove,
}: Props<I>): null | React.ReactElement => {
  const canRemove = !!onRemove;
  const [state, dispatch] = useReducer<Reducer>(reducer, {
    title: getTitle({ type, id }),
    canRemove,
    visible: active,
  });

  const timer = useRef<number>();
  const { title, visible } = state;

  useEffect(() => {
    if (active && !visible) {
      dispatch({ type: ActionType.Shown, payload: { type, id, canRemove } });
    } else if (!active && visible) {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => dispatch({ type: ActionType.Hidden }), animationTime);
    } else {
      dispatch({ type: ActionType.ChangedId, payload: { type, id, canRemove } });
    }
  }, [type, id, canRemove, active, visible]);

  useEffect((): (() => void) => (): void => clearTimeout(timer.current), []);

  const [tempFields, setTempFields] = useState<I>(initFields(item, fields));
  useEffect(() => {
    setTempFields(initFields(item, fields));
  }, [item, fields]);

  const [invalid, setInvalid] = useState<FieldKey<I>[]>([]);
  const isInvalid = invalid.length > 0;

  const onChangeField = useCallback(
    <F extends FieldKey<I>>(field: string, value: I[F] | undefined): void =>
      setTempFields((last) => ({
        ...last,
        [field]: value,
      })),
    [],
  );

  const onSubmitCallback = useCallback(() => {
    const nextInvalid = (Object.keys(fields) as FieldKey<I>[]).filter(
      (field) =>
        typeof tempFields[field] === 'undefined' ||
        (typeof tempFields[field] === 'string' && !tempFields[field]),
    );
    setInvalid(nextInvalid);

    if (!nextInvalid.length) {
      onSubmit(id, tempFields);
    }
  }, [fields, onSubmit, tempFields, id]);

  useEffect(() => {
    if (!active && isInvalid) {
      setInvalid([]);
    }
  }, [active, isInvalid]);

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
          {state.canRemove && (
            <Button type="button" disabled={loading} onClick={onRemove}>
              &minus;
            </Button>
          )}
        </Styled.Buttons>
      </Styled.ModalInner>
    </Styled.ModalDialog>
  );
};
