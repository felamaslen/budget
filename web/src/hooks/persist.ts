import { Dispatch, SetStateAction, useMemo } from 'react';

import { useDebouncedState } from './debounce';
import { useUpdateEffect } from './effect';

export type PersistentStateValidator<S> = (value: unknown | S) => value is S;

const validateAnything = (): boolean => true;

export function usePersistentStateStoreEffect<S>(state: S, key: string): void {
  useUpdateEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
}

export function usePersistentState<S>(
  defaultState: S,
  key: string,
  validator: PersistentStateValidator<S> | ((value: unknown) => boolean) | null = validateAnything,
): [S, Dispatch<SetStateAction<S>>] {
  const initialState = useMemo<S>(() => {
    try {
      const stringValue = localStorage.getItem(key);
      if (stringValue === null) {
        return defaultState;
      }
      const parsedValue = JSON.parse(stringValue);
      return validator?.(parsedValue) ? parsedValue : defaultState;
    } catch (err) {
      return defaultState;
    }
  }, [defaultState, key, validator]);

  const [state, debouncedState, setState] = useDebouncedState<S>(initialState, 1000);
  usePersistentStateStoreEffect(debouncedState, key);

  return [state, setState];
}
