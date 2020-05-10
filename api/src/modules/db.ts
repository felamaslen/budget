import knex from 'knex';
import { createPool, DatabasePoolConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';

import config from '../config';

const interceptors =
  process.env.NODE_ENV === 'development' ? [createQueryLoggingInterceptor()] : [];

export const pool = createPool(config.db.url, { interceptors });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSlonik = <R = void, A extends any[] = never[]>(
  handler: (connection: DatabasePoolConnectionType, ...args: A) => Promise<R>,
): ((...args: A) => Promise<R>) => (...args: A): Promise<R> =>
  new Promise((resolve, reject) => {
    pool.connect(
      async (connection): Promise<void> => {
        try {
          const result = await handler(connection, ...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
    );
  });

export default knex(config.db);
