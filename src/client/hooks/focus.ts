import { useEffect, useState } from 'react';

export function useWindowFocus(onFocus: (timeSinceLastFocusedMs: number) => void): void {
  const [, setLastFocused] = useState<Date>(new Date());
  const [isFocused, setFocused] = useState<boolean>(true);

  useEffect(() => {
    const onVisibilityChange = (): void => {
      if (document.hidden) {
        setLastFocused(new Date());
      }
      setFocused(!document.hidden);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return (): void => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      const now = new Date();
      setLastFocused((last) => {
        const timeSinceLastFocusedMs = now.getTime() - last.getTime();
        onFocus(timeSinceLastFocusedMs);
        return now;
      });
    }
  }, [isFocused, onFocus]);
}
