import { MouseEvent, KeyboardEvent, useCallback } from 'react';

interface EventHandlers<E> {
  onClick: (event: MouseEvent<E>) => void;
  onKeyDown: (event: KeyboardEvent<E>) => void;
}

export type Action<E> = (event: MouseEvent<E> | KeyboardEvent<E>) => void;

export default function useAnchor<E>(action: Action<E>): EventHandlers<E> {
  const onClick = useCallback((event: MouseEvent<E>) => action(event), [action]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<E>) => {
      if (event.key === 'Enter') {
        action(event);
      }
    },
    [action],
  );

  return { onClick, onKeyDown };
}
