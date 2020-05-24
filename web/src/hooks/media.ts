import { useMemo, useState, useEffect } from 'react';
import { breakpoints } from '~client/styled/variables';

export function useMediaQuery(queryString: string): boolean {
  const matchQuery = useMemo(() => window.matchMedia(queryString), [queryString]);

  const [matches, setMatches] = useState<boolean>(matchQuery.matches);
  useEffect(() => {
    matchQuery.addListener(({ matches: nowMatches }) => setMatches(nowMatches));
  }, [matchQuery]);

  return matches;
}

export const useIsMobile = (): boolean => useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`);
