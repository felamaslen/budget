import { createPool, DatabaseTransactionConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';

import config from '../config';

const interceptors =
  process.env.NODE_ENV === 'development' ? [createQueryLoggingInterceptor()] : [];

export const pool = createPool(config.db.url, { interceptors });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSlonik = <R = void, A extends any[] = never[]>(
  handler: (connection: DatabaseTransactionConnectionType, ...args: A) => Promise<R>,
): ((...args: A) => Promise<R>) => async (...args: A): Promise<R> =>
  pool.transaction((connection): Promise<R> => handler(connection, ...args));
