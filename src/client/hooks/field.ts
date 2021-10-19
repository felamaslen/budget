import moize from 'moize';
import { useRef, useReducer, useCallback, useEffect, useState } from 'react';
import { debounce } from 'throttle-debounce';

import * as Data from '~client/modules/data';
import { ActionType as NavActionType } from '~client/modules/nav';

const enum ActionType {
  ActiveToggled = 'ACTIVE_TOGGLED',
  Typed = 'TYPED',
}

type ActionActiveToggled<V> = {
  type: ActionType.ActiveToggled;
  active: boolean;
  value: V;
  inputValue: string;
};

type ActionTyped<V> = {
  type: ActionType.Typed;
  value: V;
  inputValue: string | undefined;
};

type ActionValueSet<V> = {
  type: NavActionType.ValueSet;
  payload: V | null;
};

type ActionCancelled = {
  type: NavActionType.Cancelled;
};

type Action<V> = ActionActiveToggled<V> | ActionTyped<V> | ActionValueSet<V> | ActionCancelled;

type State<V> = {
  active: boolean;
  externalValue: V; // reflects value passed into hook, e.g. from redux store
  currentValue: V; // the temporary value of the form
  inputValue: string; // the human-input value, which may deviate from currentValue
};

type Reducer<V> = (state: State<V>, action: Action<V>) => State<V>;

type ConvertExternalToInputValue<V> = (value: V, active?: boolean) => string;

const fieldReducer = moize(
  <V>(convertExternalToInputValue: ConvertExternalToInputValue<V>) =>
    (state: State<V>, action: Action<V>): State<V> => {
      if (action.type === NavActionType.ValueSet) {
        const value = action.payload === null ? state.currentValue : action.payload;
        return {
          ...state,
          externalValue: value,
          currentValue: value,
          inputValue: convertExternalToInputValue(value, state.active),
        };
      }
      if (action.type === NavActionType.Cancelled) {
        return {
          ...state,
          currentValue: state.externalValue,
          inputValue: convertExternalToInputValue(state.externalValue, false),
        };
      }
      if (action.type === ActionType.ActiveToggled) {
        if (action.active && !state.active) {
          return {
            ...state,
            active: true,
            externalValue: action.value,
            currentValue: action.value,
          };
        }

        return {
          ...state,
          active: !!action.active,
          inputValue: action.inputValue,
        };
      }
      if (action.type === ActionType.Typed) {
        return {
          ...state,
          currentValue: action.value,
          inputValue: action.inputValue ?? convertExternalToInputValue(action.value, true),
        };
      }

      return state;
    },
);

// used to make the input value diverge (temporarily) from the underlying value
export type Split<V> = {
  __split: true;
  inputValue: string;
  fieldValue: V;
};

const valueIsSplit = <V>(value: V | Split<V>): value is Split<V> =>
  typeof value === 'object' && Reflect.has(value as Record<string, unknown>, '__split');

export type FieldOptions<V, E = React.ChangeEvent<HTMLInputElement>> = {
  value: V;
  inline?: boolean;
  immediate?: boolean;
  onChange: (value: V) => void;
  onType?: (value: V) => void;
  convertInputToExternalValue?: (event: E, allowEmpty?: boolean) => V | Split<V>;
  convertExternalToInputValue?: ConvertExternalToInputValue<V>;
  allowEmpty?: boolean;
  active?: boolean;
};

export type Result<V, E> = Pick<State<V>, 'currentValue' | 'inputValue'> & {
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  onChange: (event: E) => void;
  onBlur: () => void;
  onCancel: () => void;
};

const isCustomEvent = <E>(event: E | React.ChangeEvent<HTMLInputElement>): event is E =>
  !Reflect.has(event ?? {}, 'target');

const focusInput = debounce(5, <V, E>(inputRef: Result<V, E>['inputRef']): void => {
  if (inputRef.current) {
    inputRef.current.focus();
    inputRef.current.select();
  }
});

export function useField<V = string, E = React.ChangeEvent<HTMLInputElement>>({
  value,
  inline = false,
  immediate = false,
  onChange,
  onType = Data.NULL,
  convertInputToExternalValue = (event: E | React.ChangeEvent<HTMLInputElement>): V | Split<V> =>
    isCustomEvent(event)
      ? (event as unknown as V | Split<V>)
      : (event.target.value as unknown as V),
  convertExternalToInputValue = Data.IDENTITY,
  allowEmpty = false,
  active = false,
}: FieldOptions<V, E>): Result<V, E> {
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, dispatch] = useReducer<Reducer<V>>(fieldReducer(convertExternalToInputValue), {
    active,
    externalValue: value,
    currentValue: value,
    inputValue: convertExternalToInputValue(value, false),
  });

  useEffect(() => {
    dispatch({ type: NavActionType.ValueSet, payload: value });
  }, [value]);

  const lastOnChangeCallValue = useRef<V | undefined>(state.currentValue);

  useEffect(() => {
    if (!inline) {
      return;
    }
    if (active && !state.active) {
      focusInput(inputRef);
    }
    if (active !== state.active) {
      lastOnChangeCallValue.current = undefined;
      dispatch({
        type: ActionType.ActiveToggled,
        active,
        value,
        inputValue: convertExternalToInputValue(state.currentValue, active),
      });
    }
  }, [
    inline,
    onChange,
    active,
    value,
    state.active,
    state.currentValue,
    state.externalValue,
    convertExternalToInputValue,
  ]);

  const onChangeInput = useCallback(
    (event: E): void => {
      try {
        const newValue = convertInputToExternalValue(event, allowEmpty);
        const fieldValue = valueIsSplit(newValue) ? newValue.fieldValue : newValue;
        const inputValue = valueIsSplit(newValue) ? newValue.inputValue : undefined;

        dispatch({
          type: ActionType.Typed,
          value: fieldValue,
          inputValue,
        });

        onType(fieldValue);
        if (immediate) {
          onChange(fieldValue);
        }
      } catch {
        // do nothing
      }
    },
    [convertInputToExternalValue, allowEmpty, onType, immediate, onChange],
  );

  const [shouldCallOnChange, callOnChange] = useState<boolean>(false);
  useEffect(() => {
    if (shouldCallOnChange && state.currentValue !== lastOnChangeCallValue.current) {
      lastOnChangeCallValue.current = state.currentValue;
      onChange(state.currentValue);
    }
    callOnChange(false);
  }, [shouldCallOnChange, onChange, state.currentValue]);

  const onBlur = useCallback(() => {
    if (!immediate) {
      dispatch({ type: NavActionType.ValueSet, payload: null });
      callOnChange(true);
    }
  }, [immediate]);

  const onCancel = useCallback(() => {
    dispatch({ type: NavActionType.Cancelled });
  }, []);

  return {
    currentValue: state.currentValue,
    inputValue: state.inputValue,
    inputRef,
    onChange: onChangeInput,
    onBlur,
    onCancel,
  };
}
