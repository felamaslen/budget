import path from 'path';
import knex, { Config, PgConnectionConfig } from 'knex';
import { getDbUrl } from '~api/db-url';

function parseConnectionURI(uri = ''): PgConnectionConfig {
  const matches = uri.match(
    /^postgres(ql)?:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/,
  );

  if (!matches) {
    throw new Error('invalid database string');
  }

  const [, , user, password, host, , , port, database] = matches;

  return {
    user,
    password,
    host,
    port: Number(port) || 5432,
    database,
  };
}

export const knexConfig: Config = {
  client: 'pg',
  connection: parseConnectionURI(getDbUrl()),
  seeds: {
    directory: path.resolve(
      __dirname,
      '../seeds',
      process.env.NODE_ENV === 'test' ? 'test' : 'production',
    ),
  },
  migrations: {
    directory: path.resolve(__dirname, '../migrations'),
  },
};

export default knex(knexConfig);
