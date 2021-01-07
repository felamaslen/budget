import { Server } from 'http';

declare global {
  namespace NodeJS {
    interface Global {
      server: Server;
    }
  }

  interface Window {
    __MOUNT_TIME__: number;
  }
}
