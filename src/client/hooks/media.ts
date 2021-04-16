import { useMemo, useState, useEffect } from 'react';
import { VOID } from '~client/modules/data';
import { isServerSide } from '~client/modules/ssr';
import { breakpoints } from '~client/styled/variables';

const shouldSkip = isServerSide && process.env.NODE_ENV !== 'test';

export function useMediaQuery(queryString: string): boolean {
  const matchQuery = useMemo(
    () => (shouldSkip ? ({ matches: false } as MediaQueryList) : window.matchMedia(queryString)),
    [queryString],
  );

  const [matches, setMatches] = useState<boolean>(matchQuery.matches);
  useEffect(() => {
    if (shouldSkip) {
      return VOID;
    }

    const listener = ({ matches: nowMatches }: MediaQueryListEvent): void => setMatches(nowMatches);
    matchQuery.addListener(listener);

    return (): void => {
      matchQuery.removeListener(listener);
    };
  }, [matchQuery]);

  return matches;
}

export const useIsMobile = (): boolean => useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
