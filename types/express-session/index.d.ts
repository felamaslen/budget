import 'express-session';

declare module 'express-session' {
  interface SessionData {
    uid: number | null;
    apiKey: string | null;
  }
}
