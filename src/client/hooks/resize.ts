import { useEffect, useState, createContext } from 'react';
import { debounce } from 'throttle-debounce';

import { isServerSide } from '~client/modules/ssr';

export const ResizeContext = createContext(0);

export function useDebouncedResize(): number {
  const [windowWidth, setWindowWidth] = useState<number>(isServerSide ? 0 : window.innerWidth);

  useEffect(() => {
    if (isServerSide) {
      return undefined;
    }
    const listener = debounce(50, (): void => setWindowWidth(window.innerWidth));
    window.addEventListener('resize', listener);
    return (): void => window.removeEventListener('resize', listener);
  }, []);

  return windowWidth;
}
