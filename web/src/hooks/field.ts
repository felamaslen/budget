import { useRef, useReducer, useCallback, useEffect } from 'react';

import * as Data from '~client/modules/data';
import { ActionType as NavActionType } from '~client/modules/nav';
import { NULL_COMMAND } from '~client/hooks/nav';

enum ActionType {
  ActiveToggled,
  Typed,
}

type ActionActiveToggled<FV, IV> = {
  type: ActionType.ActiveToggled;
  active: boolean;
  value: FV;
  inputValue: IV;
};

type ActionTyped<FV, IV> = {
  type: ActionType.Typed;
  value: FV;
  inputValue?: IV;
};

type ActionValueSet<FV> = {
  type: NavActionType.ValueSet;
  payload: FV;
};

type ActionCancelled = {
  type: NavActionType.Cancelled;
};

type Action<FV, IV> =
  | ActionActiveToggled<FV, IV>
  | ActionTyped<FV, IV>
  | ActionValueSet<FV>
  | ActionCancelled;

type State<FV, IV> = {
  active: boolean;
  initialValue: FV;
  currentValue: FV;
  inputValue: IV;
};

type Reducer<FV, IV> = (state: State<FV, IV>, action: Action<FV, IV>) => State<FV, IV>;

const isAction = <FV, IV>(action: Action<FV, IV> | {}): action is Action<FV, IV> =>
  Reflect.has(action, 'type');

function fieldReducer<FV, IV>(state: State<FV, IV>, action: Action<FV, IV> | {}): State<FV, IV> {
  if (!isAction<FV, IV>(action)) {
    return state;
  }
  if (action.type === NavActionType.ValueSet) {
    return { ...state, currentValue: action.payload };
  }
  if (action.type === NavActionType.Cancelled) {
    return { ...state, currentValue: state.initialValue };
  }
  if (action.type === ActionType.ActiveToggled) {
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
  if (action.type === ActionType.Typed) {
    return {
      ...state,
      currentValue: action.value,
      inputValue: action.inputValue ?? ((action.value as unknown) as IV),
    };
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
  setValue?: Data.Identity<string, FV | Split<FV, IV>>;
  getInitialInputValue?: (value: FV) => IV;
  command?: Action<FV, IV> | {};
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
  onType = Data.NULL,
  setValue = Data.IDENTITY,
  getInitialInputValue = Data.IDENTITY,
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
    dispatch({ type: NavActionType.ValueSet, payload: value });
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
        type: ActionType.ActiveToggled,
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
    if (inline && isAction(command)) {
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
            type: ActionType.Typed,
            value: fieldValue,
            inputValue,
          });
        } else {
          dispatch({ type: ActionType.Typed, value: newValue });
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
