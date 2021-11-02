import { EffectCallback, DependencyList, useEffect, useRef } from 'react';

export function useUpdateEffect(effect: EffectCallback, deps: DependencyList = []): void {
  const hasChanged = useRef<boolean>(false);
  useEffect(() => {
    if (!hasChanged.current) {
      hasChanged.current = true;
      return undefined;
    }
    return effect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}
