import { createPool, DatabasePoolConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';
import config from '~/server/config';

const interceptors = [createQueryLoggingInterceptor()];

const pool = createPool(config.databaseUrl, { interceptors });

export const withDb = <T>(handler: (db: DatabasePoolConnectionType, ...args: any[]) => any) => (
  ...args: any[]
) =>
  pool.connect<T>(async db => {
    const result = await handler(db, ...args);

    return result;
  });
