import { useDebounce } from '@react-hook/debounce';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function useDebouncedState<S>(
  initialState: S,
  wait?: number,
  leading?: boolean,
): [S, S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(initialState);
  const [debouncedState, setDebouncedState] = useDebounce<S>(initialState, wait, leading);

  useEffect(() => {
    setDebouncedState(state);
  }, [state, setDebouncedState]);

  return [state, debouncedState, setState];
}
