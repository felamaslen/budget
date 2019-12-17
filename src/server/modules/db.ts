import { createPool, DatabasePoolConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';
import config from '~/server/config';

const interceptors = [createQueryLoggingInterceptor()];

const pool = createPool(config.databaseUrl, { interceptors });

export const withDb = <T = void>(
  handler: (db: DatabasePoolConnectionType, ...args: any[]) => Promise<T>,
) => (...args: any[]): Promise<T> =>
  pool.connect<T>(async db => {
    const result = await handler(db, ...args);

    return result;
  });
