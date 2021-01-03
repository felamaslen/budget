import { useEffect, useState } from 'react';

export function useOffline(): boolean {
  const [offline, setOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const onDisconnect = (): void => setOffline(true);
    const onReconnect = (): void => setOffline(false);

    window.addEventListener('offline', onDisconnect);
    window.addEventListener('online', onReconnect);

    return (): void => {
      window.removeEventListener('offline', onDisconnect);
      window.removeEventListener('online', onReconnect);
    };
  }, []);

  return offline;
}
