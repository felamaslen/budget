import { useEffect, useState, createContext } from 'react';
import { debounce } from 'throttle-debounce';

export const ResizeContext = createContext(window.innerWidth);

export function useDebouncedResize(): number {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const listener = debounce(50, (): void => setWindowWidth(window.innerWidth));
    window.addEventListener('resize', listener);
    return (): void => window.removeEventListener('resize', listener);
  }, []);

  return windowWidth;
}
