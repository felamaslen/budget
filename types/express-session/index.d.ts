import 'express-session';
import { AppConfig } from '~client/types/gql';

declare module 'express-session' {
  interface SessionData {
    uid: number | null;
    apiKey: string | null;
    config: Partial<Omit<AppConfig, 'birthDate' | 'pieTolerance' | 'futureMonths'>>;
  }
}
