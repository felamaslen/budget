import { useEffect, useRef, useState } from 'react';

export function useOffline(): [boolean, boolean] {
  const [offline, setOffline] = useState<boolean>(!navigator.onLine);
  const wasOffline = useRef<boolean>(!navigator.onLine);

  useEffect(() => {
    const onDisconnect = (): void => {
      setOffline(true);
      wasOffline.current = true;
    };
    const onReconnect = (): void => setOffline(false);

    window.addEventListener('offline', onDisconnect);
    window.addEventListener('online', onReconnect);

    return (): void => {
      window.removeEventListener('offline', onDisconnect);
      window.removeEventListener('online', onReconnect);
    };
  }, []);

  return [offline, wasOffline.current];
}
