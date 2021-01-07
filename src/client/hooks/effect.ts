import { EffectCallback, DependencyList, useEffect, useRef } from 'react';

import { VOID } from '~client/modules/data';

export function useUpdateEffect(effect: EffectCallback, deps: DependencyList = []): void {
  const hasChanged = useRef<boolean>(false);
  useEffect(() => {
    if (!hasChanged.current) {
      hasChanged.current = true;
      return VOID;
    }
    return effect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useInitialEffect(effect: EffectCallback, deps: DependencyList = []): void {
  const hasChanged = useRef<boolean>(false);
  useEffect(() => {
    if (!hasChanged.current) {
      hasChanged.current = true;
      return effect();
    }
    return VOID;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
