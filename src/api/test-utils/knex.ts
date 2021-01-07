import path from 'path';
import url from 'url';

import Knex from 'knex';

import config from '~api/config';

function parseConnectionURI(uri = ''): Knex.PgConnectionConfig {
  const parsedUrl = url.parse(uri);

  if (!parsedUrl.protocol || !['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('Invalid database protocol');
  }

  const [user, password] = parsedUrl.auth?.split(':') ?? [undefined, undefined];

  const host = parsedUrl.hostname;
  const port = parsedUrl.port ?? '5432';
  const database = parsedUrl.path?.substring(1);

  if (!(host && database)) {
    throw new Error('Must set database host and name');
  }

  return {
    user,
    password,
    host,
    port: Number(port),
    database,
  };
}

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: parseConnectionURI(config.db.url),
  seeds: {
    directory: path.join(
      __dirname,
      '../seeds',
      process.env.NODE_ENV === 'test' ? 'test' : 'production',
    ),
  },
  migrations: {
    directory: path.resolve(__dirname, '../migrations'),
  },
};

export const db = Knex(knexConfig);
