/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useMemo, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';

export type Validator<S> = (value: any | S) => value is S;

const validateAnything = (): boolean => true;

export function usePersistentState<S>(
  defaultState: S,
  key: string,
  validator: Validator<S> | ((value: any) => boolean) = validateAnything,
): [S, Dispatch<SetStateAction<S>>] {
  const initialState = useMemo<S>(() => {
    try {
      const stringValue = localStorage.getItem(key);
      if (stringValue === null) {
        return defaultState;
      }
      const parsedValue = JSON.parse(stringValue);
      return validator(parsedValue) ? parsedValue : defaultState;
    } catch (err) {
      return defaultState;
    }
  }, [defaultState, key, validator]);

  const [state, setState] = useState<S>(initialState);

  const [persistentState] = useDebounce<S>(state, 1000);

  const stateHasChanged = useRef<boolean>(false);
  useEffect(() => {
    if (!stateHasChanged.current) {
      stateHasChanged.current = true;
      return;
    }
    localStorage.setItem(key, JSON.stringify(persistentState));
  }, [persistentState, key]);

  return [state, setState];
}
