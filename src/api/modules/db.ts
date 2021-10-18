import moize from 'moize';
import { createPool, createTypeParserPreset, DatabaseTransactionConnectionType } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';

import config from '../config';

const interceptors =
  process.env.NODE_ENV === 'development' ? [createQueryLoggingInterceptor()] : [];

const parseDateOrNull = (value: string | null): Date | null =>
  value === null ? value : new Date(value);

export const getPool = moize(() =>
  createPool(config.db.url, {
    interceptors,
    idleTimeout: process.env.NODE_ENV === 'test' ? 'DISABLE_TIMEOUT' : undefined,
    statementTimeout: process.env.NODE_ENV === 'test' ? 'DISABLE_TIMEOUT' : undefined,
    idleInTransactionSessionTimeout:
      process.env.NODE_ENV === 'test' ? 'DISABLE_TIMEOUT' : undefined,
    typeParsers: [
      ...createTypeParserPreset(),
      {
        name: 'int8',
        // return BIGINT as string because the max value doesn't fit into JS number type
        parse: String,
      },
      {
        name: 'date',
        parse: parseDateOrNull,
      },
      {
        name: 'timestamp',
        parse: parseDateOrNull,
      },
      {
        name: 'timestamptz',
        parse: parseDateOrNull,
      },
    ],
  }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withSlonik =
  <R = void, A extends unknown[] = never[]>(
    handler: (connection: DatabaseTransactionConnectionType, ...args: A) => Promise<R>,
  ): ((...args: A) => Promise<R>) =>
  async (...args: A): Promise<R> =>
    getPool().transaction((connection): Promise<R> => handler(connection, ...args));
