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

type State<FV, IV> = {
  active: boolean;
  initialValue: FV;
  currentValue: FV;
  inputValue: IV;
};

type Action = {
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
};

type Reducer<FV, IV> = (state: State<FV, IV>, action: Action) => State<FV, IV>;

function fieldReducer<FV, IV>(state: State<FV, IV>, action: Action): State<FV, IV> {
  if (action.type === VALUE_SET) {
    return { ...state, currentValue: action.payload as FV };
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
export type Split<FV, IV = string> = {
  __split: true;
  inputValue: IV;
  fieldValue: FV;
};

const valueIsNotSplit = <FV, IV>(value: FV | Split<FV, IV>): value is FV =>
  typeof value !== 'object';
const valueIsSplit = <FV, IV>(value: FV | Split<FV, IV>): value is Split<FV, IV> =>
  !valueIsNotSplit(value) && value.__split;

type Options<FV, IV> = {
  value: FV;
  inline?: boolean;
  onChange: (value: FV) => void;
  onType?: (value: FV | Split<FV, IV>) => void;
  setValue?: (value: string) => FV | Split<FV, IV>;
  getInitialInputValue?: (value: FV) => IV;
  command?: Action;
  active?: boolean;
};

type Result<FV, IV, I> = [
  FV,
  IV,
  (event: React.ChangeEvent<I>) => void,
  React.MutableRefObject<I | null>,
  () => void,
];

export function useField<FV = string, IV = string, I extends HTMLInputElement = HTMLInputElement>({
  value,
  inline = false,
  onChange,
  onType = NULL,
  setValue = IDENTITY,
  getInitialInputValue = IDENTITY,
  command = NULL_COMMAND,
  active = false,
}: Options<FV, IV>): Result<FV, IV, I> {
  const inputRef = useRef<I>(null);

  const [state, dispatch] = useReducer<Reducer<FV, IV>>(fieldReducer, {
    active: false,
    initialValue: value,
    currentValue: value,
    inputValue: getInitialInputValue(value),
  });

  useEffect(() => {
    dispatch({ type: VALUE_SET, payload: value });
  }, [value]);

  useEffect(() => {
    if (!inline) {
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
    inline,
    onChange,
    active,
    value,
    state.active,
    state.currentValue,
    state.initialValue,
    getInitialInputValue,
  ]);

  useEffect(() => {
    if (inline && command !== NULL_COMMAND) {
      dispatch(command);
    }
  }, [inline, command]);

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
    if (!inline) {
      onChange(state.currentValue);
    }
  }, [inline, onChange, state.currentValue]);

  return [state.currentValue, state.inputValue, onChangeInput, inputRef, onBlurInput];
}
