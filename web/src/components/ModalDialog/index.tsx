import startOfDay from 'date-fns/startOfDay';
import React, { useRef, useState, useReducer, useEffect, useCallback } from 'react';

import { ModalDialogField, ModalFields } from './field';
import * as Styled from './styles';

import { CREATE_ID } from '~client/constants/data';
import { Button, ButtonSubmit, ButtonCancel } from '~client/styled/shared';
import { Item, Delta, Create, FieldKey } from '~client/types';

export { ModalFields, makeField, FieldWrapper } from './field';

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
  id?: string;
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

function initField<I extends Item>(field: 'date', item: Delta<I>): Date;
function initField<I extends Item>(field: 'cost', item: Delta<I>): number;
function initField<I extends Item, K extends keyof I>(field: keyof I, item: Delta<I>): I[K];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initField<I extends Item>(field: FieldKey<I>, item: Delta<I>): any {
  if (field === 'date' && !Reflect.get(item, field)) {
    return startOfDay(new Date());
  }
  if (field === 'cost' && typeof Reflect.get(item, field) === 'undefined') {
    return 0;
  }
  return item[field] ?? '';
}

const initFields = <I extends Item>(item: Delta<I>, fields: ModalFields<I>): Create<I> =>
  (Object.keys(fields) as FieldKey<I>[]).reduce<Create<I>>(
    (last, field) => ({
      ...last,
      [field]: initField(field, item),
    }),
    item as Create<I>,
  );

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

export type Props<I extends Item> = {
  active: boolean;
  loading?: boolean;
  type?: DialogType;
  id?: string;
  item?: Delta<I>;
  fields?: ModalFields<I>;
  onCancel: () => void;
  onSubmit: (item: I) => void;
  onRemove?: () => void;
};

const empty = {};

const ModalDialog = <I extends Item>({
  active,
  loading = false,
  id = CREATE_ID,
  item = empty,
  fields = empty as ModalFields<I>,
  type = 'edit',
  onCancel,
  onSubmit,
  onRemove,
}: Props<I>): null | React.ReactElement<I> => {
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
      timer.current = setTimeout(() => dispatch({ type: ActionType.Hidden }), animationTime);
    } else {
      dispatch({ type: ActionType.ChangedId, payload: { type, id, canRemove } });
    }
  }, [type, id, canRemove, active, visible]);

  useEffect((): (() => void) => (): void => clearTimeout(timer.current), []);

  const [tempFields, setTempFields] = useState<Create<I>>(initFields(item, fields));
  useEffect(() => {
    setTempFields(initFields(item, fields));
  }, [item, fields]);

  const [invalid, setInvalid] = useState<FieldKey<I>[]>([]);
  const isInvalid = invalid.length > 0;

  const onChangeField = useCallback(
    <F extends FieldKey<I>>(field: string, value: I[F]): void =>
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
      onSubmit({ id, ...tempFields } as I);
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

export default ModalDialog;
