import React, { useRef, useState, useReducer, useEffect, useCallback } from 'react';
import { compose } from '@typed/compose';
import { DateTime } from 'luxon';
import { replaceAtIndex } from 'replace-array';

import { validateField } from '~client/modules/validate';
import { Button, ButtonSubmit, ButtonCancel } from '~client/styled/shared/button';
import ModalDialogField from './field';

import * as Styled from './styles';

type State = {
  visible: boolean;
  title: string;
  canRemove: boolean;
};

enum ActionType {
  Hidden,
  Shown,
  ChangedId,
}

type PersistentStatePayload = {
  type: Props['type'];
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

type Field = {
  item: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
};

const withDefaultDate = (fields: Field[]): Field[] =>
  replaceAtIndex(
    fields,
    fields.findIndex(({ item, value }) => item === 'date' && !value),
    {
      item: 'date',
      value: DateTime.local(),
    },
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

export type Props = {
  active: boolean;
  loading?: boolean;
  type?: 'edit' | 'add';
  id?: string;
  fields?: Field[];
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (item: any) => void;
  onRemove?: () => void;
};

const ModalDialog: React.FC<Props> = ({
  active,
  loading = false,
  id,
  fields = [],
  type = 'edit',
  onCancel,
  onSubmit,
  onRemove,
}) => {
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

  const [tempFields, setTempFields] = useState<Field[]>([]);
  useEffect(() => {
    setTempFields(compose(withDefaultDate)(fields.slice()));
  }, [fields]);

  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const onChangeField = useCallback(
    (item, value) =>
      setTempFields(last =>
        replaceAtIndex(
          last,
          last.findIndex(({ item: thisItem }) => thisItem === item),
          {
            item,
            value,
          },
        ),
      ),
    [],
  );

  const onSubmitCallback = useCallback(() => {
    const nextInvalid = tempFields.reduce((last, { item, value }) => {
      try {
        validateField(item, value);

        return last;
      } catch (err) {
        return { ...last, [item]: true };
      }
    }, {});

    setInvalid(nextInvalid);

    if (!Object.keys(nextInvalid).length) {
      onSubmit(tempFields.reduce((last, { item, value }) => ({ ...last, [item]: value }), { id }));
    }
  }, [onSubmit, tempFields, id]);

  useEffect(() => {
    if (!active && Object.keys(invalid).length) {
      setInvalid({});
    }
  }, [active, invalid]);

  if (!visible) {
    return null;
  }

  return (
    <Styled.ModalDialog>
      <Styled.ModalInner active={active} isLoading={loading}>
        <Styled.Title>{title}</Styled.Title>
        <Styled.FormList data-testid="form-list">
          {fields.map(({ item, value }) => (
            <ModalDialogField
              key={item}
              item={item}
              value={value}
              invalid={Boolean(invalid[item])}
              onChange={onChangeField}
            />
          ))}
        </Styled.FormList>
        <Styled.Buttons>
          <ButtonCancel type="button" disabled={loading} onClick={onCancel}>
            {'nope.avi'}
          </ButtonCancel>
          <ButtonSubmit type="button" disabled={loading} onClick={onSubmitCallback}>
            {'Do it.'}
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
