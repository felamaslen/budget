/**
 * Hook for an interactive, generic form field
 * `setValue` is used to set the *state value* from the *input value*
 * Components which use this hook are responsible for rendering the input
 */

import { useRef, useReducer, useCallback, useEffect } from 'react';

import { NULL, IDENTITY } from '~client/modules/data';
import { VALUE_SET, CANCELLED } from '~client/modules/nav';
import { NULL_COMMAND } from '~client/hooks/nav';

const ACTIVE_TOGGLED = 'ACTIVE_TOGGLED';
const TYPED = 'TYPED';

type State<V> = {
  active: boolean;
  initialValue: V;
  currentValue: V;
  inputValue: V;
};

type Action = {
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
};

type Reducer<V> = (state: State<V>, action: Action) => State<V>;

function fieldReducer<V>(state: State<V>, action: Action): State<V> {
  if (action.type === VALUE_SET) {
    return { ...state, currentValue: action.payload as V };
  }
  if (action.type === CANCELLED) {
    return { ...state, currentValue: state.initialValue };
  }
  if (action.type === ACTIVE_TOGGLED) {
    if (action.active && !state.active) {
      return {
        ...state,
        active: true,
        initialValue: action.value,
        currentValue: action.value,
      };
    }

    return {
      ...state,
      active: !!action.active,
      inputValue: action.inputValue,
    };
  }
  if (action.type === TYPED) {
    const { value: currentValue, inputValue = currentValue } = action;

    return { ...state, currentValue, inputValue };
  }

  return state;
}

// used to make the input value diverge (temporarily) from the underlying value
type Split<V> = {
  __split: true;
  inputValue: V;
  fieldValue: V;
};

const valueIsNotSplit = <V>(value: V | Split<V>): value is V => typeof value !== 'object';
const valueIsSplit = <V>(value: V | Split<V>): value is Split<V> =>
  !valueIsNotSplit(value) && value.__split;

type Options<V> = {
  value: V;
  string?: boolean;
  onChange: (value: V) => void;
  onType?: (value: V | Split<V>) => void;
  setValue?: (value: V) => V | Split<V>;
  getInitialInputValue?: (value: V) => V;
  command?: Action;
  active?: boolean;
};

type Result<V, I> = [
  V,
  V,
  (event: React.ChangeEvent<I>) => void,
  React.MutableRefObject<I | null>,
  () => void,
];

export function useField<V, I extends HTMLInputElement = HTMLInputElement>({
  value,
  string: isString = false,
  onChange,
  onType = NULL,
  setValue = IDENTITY,
  getInitialInputValue = IDENTITY,
  command = NULL_COMMAND,
  active = false,
}: Options<V>): Result<V, I> {
  const inputRef = useRef<I>(null);

  const [state, dispatch] = useReducer<Reducer<V>>(fieldReducer, {
    active: false,
    initialValue: value,
    currentValue: value,
    inputValue: getInitialInputValue(value),
  });

  useEffect(() => {
    dispatch({ type: VALUE_SET, payload: value });
  }, [value]);

  useEffect(() => {
    if (!isString) {
      return;
    }
    if (!active && state.active && state.currentValue !== state.initialValue) {
      onChange(state.currentValue);
    }
    if (active !== state.active) {
      dispatch({
        type: ACTIVE_TOGGLED,
        active,
        value,
        inputValue: getInitialInputValue(state.initialValue),
      });
    }
    if (active && !state.active) {
      setImmediate((): void => {
        if (!inputRef.current) {
          return;
        }

        inputRef.current.focus();
        inputRef.current.select();
      });
    } else if (!active && state.active && inputRef.current) {
      inputRef.current.blur();
    }
  }, [
    isString,
    onChange,
    active,
    value,
    state.active,
    state.currentValue,
    state.initialValue,
    getInitialInputValue,
  ]);

  useEffect(() => {
    if (isString && command !== NULL_COMMAND) {
      dispatch(command);
    }
  }, [isString, command]);

  const onChangeInput = useCallback(
    event => {
      try {
        const newValue = setValue(event.target.value);
        if (valueIsSplit(newValue)) {
          const { fieldValue, inputValue } = newValue;
          dispatch({
            type: TYPED,
            value: fieldValue,
            inputValue,
          });
        } else {
          dispatch({ type: TYPED, value: newValue });
        }

        onType(newValue);
      } catch {
        // do nothing
      }
    },
    [setValue, onType],
  );

  const onBlurInput = useCallback(() => {
    if (!isString) {
      onChange(state.currentValue);
    }
  }, [isString, onChange, state.currentValue]);

  return [state.currentValue, state.inputValue, onChangeInput, inputRef, onBlurInput];
}
