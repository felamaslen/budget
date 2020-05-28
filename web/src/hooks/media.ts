import { useMemo, useState, useEffect } from 'react';
import { breakpoints } from '~client/styled/variables';

export function useMediaQuery(queryString: string): boolean {
  const matchQuery = useMemo(() => window.matchMedia(queryString), [queryString]);

  const [matches, setMatches] = useState<boolean>(matchQuery.matches);
  useEffect(() => {
    const listener = ({ matches: nowMatches }: MediaQueryListEvent): void => setMatches(nowMatches);
    matchQuery.addListener(listener);

    return (): void => {
      matchQuery.removeListener(listener);
    };
  }, [matchQuery]);

  return matches;
}

export const useIsMobile = (): boolean => useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
