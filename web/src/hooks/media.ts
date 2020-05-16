import { useMemo, useState, useEffect } from 'react';

export function useMediaQuery(queryString: string): boolean {
  const matchQuery = useMemo(() => window.matchMedia(queryString), [queryString]);

  const [matches, setMatches] = useState<boolean>(false);
  useEffect(() => {
    matchQuery.addListener(({ matches: nowMatches }) => setMatches(nowMatches));
  }, [matchQuery]);

  return matches;
}
