import React, { ReactEventHandler, useMemo } from 'react';
import { debounce } from 'throttle-debounce';
import { isEnter } from '~client/modules/nav';

type Options = {
  stopPropagation?: boolean;
};

export const stopEventPropagation = <E extends HTMLElement = HTMLElement>(
  event: React.MouseEvent<E>,
): void => event.stopPropagation();

export type CTAEvents<E extends HTMLElement = HTMLElement> = {
  onClick: ReactEventHandler<E>;
  onKeyDown: ReactEventHandler<E>;
};

export function useCTA<E extends HTMLElement = HTMLElement>(
  onActivate: () => void,
  options?: Options,
): CTAEvents<E> {
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
          stopEventPropagation(event);
        }
        debouncedActivate();
      },
    };
  }, [onActivate, stopPropagation]);

  return events;
}
