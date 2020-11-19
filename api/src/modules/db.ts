import moize from 'moize';
import { createPool, DatabaseTransactionConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';

import config from '../config';
import { withDatabaseName } from '../db-url';

const interceptors =
  process.env.NODE_ENV === 'development' ? [createQueryLoggingInterceptor()] : [];

export const getPool = moize((databaseName?: string) =>
  createPool(withDatabaseName(config.db.url, databaseName), { interceptors }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSlonik = <R = void, A extends any[] = never[]>(
  handler: (connection: DatabaseTransactionConnectionType, ...args: A) => Promise<R>,
) => (databaseName?: string): ((...args: A) => Promise<R>) => async (...args: A): Promise<R> =>
  getPool(databaseName).transaction((connection): Promise<R> => handler(connection, ...args));
