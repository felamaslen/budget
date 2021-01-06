import { useEffect, useState, createContext } from 'react';
import { debounce } from 'throttle-debounce';

import { VOID } from '~client/modules/data';
import { isServerSide } from '~client/modules/ssr';

const initialWindowWidth = isServerSide ? 0 : window.innerWidth;

export const ResizeContext = createContext(initialWindowWidth);

export function useDebouncedResize(): number {
  const [windowWidth, setWindowWidth] = useState<number>(initialWindowWidth);

  useEffect(() => {
    if (isServerSide) {
      return VOID;
    }
    const listener = debounce(50, (): void => setWindowWidth(window.innerWidth));
    window.addEventListener('resize', listener);
    return (): void => window.removeEventListener('resize', listener);
  }, []);

  return windowWidth;
}
