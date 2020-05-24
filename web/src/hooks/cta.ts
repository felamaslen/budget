import { ReactEventHandler, KeyboardEvent, useMemo } from 'react';

type Options = {
  stopPropagation?: boolean;
};

export function useCTA<E extends HTMLElement = HTMLElement>(
  onActivate: () => void,
  options?: Options,
): {
  onClick: ReactEventHandler<E>;
  onKeyDown: ReactEventHandler<E>;
} {
  const stopPropagation = !!options?.stopPropagation;
  const events = useMemo(
    () => ({
      onKeyDown: (event: React.KeyboardEvent<E>): void => {
        if (event.key === 'Enter') {
          onActivate();
        }
      },
      onClick: (event: React.MouseEvent<E>): void => {
        if (stopPropagation) {
          event.stopPropagation();
        }
        onActivate();
      },
    }),
    [onActivate, stopPropagation],
  );

  return events;
}
