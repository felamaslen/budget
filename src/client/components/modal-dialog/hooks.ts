import startOfDay from 'date-fns/startOfDay';
import omit from 'lodash/omit';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import type { DialogType, ModalFields, Props, State } from './types';

import { CREATE_ID } from '~client/constants/data';
import type { Delta, FieldKey } from '~client/types';
import type { ListItemInput } from '~client/types/gql';

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

export type Action = ActionHidden | ActionShown | ActionChangedId;

export type Reducer = (state: State, action: Action) => State;

function getTitle({ type, id }: Pick<PersistentStatePayload, 'type' | 'id'>): string {
  if (type === 'edit') {
    return `Editing id#${id}`;
  }
  return 'Add item';
}

const updatePersistentState = (
  state: State,
  { payload }: { payload: PersistentStatePayload },
): State => ({
  ...state,
  title: getTitle(payload),
  canRemove: payload.canRemove,
});

export const reducer: Reducer = (state, action): State => {
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

export const animationTime = 350;

export function useModalState<I extends ListItemInput>({
  type = 'edit',
  id = CREATE_ID,
  onRemove,
  active,
}: Pick<Props<I>, 'id' | 'active' | 'type' | 'onRemove'>): State {
  const canRemove = !!onRemove;
  const [state, dispatch] = useReducer<Reducer>(reducer, {
    title: getTitle({ type, id }),
    canRemove,
    visible: active,
  });

  const timer = useRef<number>();

  useEffect((): (() => void) => (): void => clearTimeout(timer.current), []);

  useEffect(() => {
    if (active && !state.visible) {
      dispatch({ type: ActionType.Shown, payload: { type, id, canRemove } });
    } else if (!active && state.visible) {
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        dispatch({ type: ActionType.Hidden });
      }, animationTime);
    } else {
      dispatch({ type: ActionType.ChangedId, payload: { type, id, canRemove } });
    }
  }, [type, id, canRemove, active, state.visible]);

  return state;
}

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

export const emptyFields = {};
export const emptyItem = {};

export function useModalSubmit<I extends ListItemInput>({
  active,
  fields = emptyFields,
  id = CREATE_ID,
  item = emptyItem,
  onSubmit,
}: Pick<Props<I>, 'active' | 'fields' | 'id' | 'item' | 'onSubmit'>): {
  tempFields: I;
  invalid: FieldKey<I>[];
  onSubmitCallback: () => void;
  onChangeField: <F extends FieldKey<I>>(field: string, value: I[F] | undefined) => void;
} {
  const [tempFields, setTempFields] = useState<I>(initFields<I>(item, fields));
  useEffect(() => {
    setTempFields(initFields(item, fields));
  }, [item, fields]);

  const [invalid, setInvalid] = useState<FieldKey<I>[]>([]);
  const isInvalid = invalid.length > 0;

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

  const onChangeField = useCallback(
    <F extends FieldKey<I>>(field: string, value: I[F] | undefined): void =>
      setTempFields((last) => ({
        ...last,
        [field]: value,
      })),
    [],
  );

  return { tempFields, invalid, onSubmitCallback, onChangeField };
}
