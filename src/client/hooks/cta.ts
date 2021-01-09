import React, { ReactEventHandler, useMemo } from 'react';
import { debounce } from 'throttle-debounce';
import { isEnter } from '~client/modules/nav';

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
  const events = useMemo(() => {
    const debouncedActivate = debounce(10, true, onActivate);
    return {
      onKeyDown: (event: React.KeyboardEvent<E>): void => {
        if (isEnter(event)) {
          debouncedActivate();
        }
      },
      onClick: (event: React.MouseEvent<E>): void => {
        if (stopPropagation) {
          event.stopPropagation();
        }
        debouncedActivate();
      },
    };
  }, [onActivate, stopPropagation]);

  return events;
}
