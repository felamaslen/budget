import path from 'path';
import * as Knex from 'knex';
import { getDbUrl } from '~api/db-url';

function parseConnectionURI(uri = ''): Knex.PgConnectionConfig {
  const matches = uri.match(
    /^postgres(ql)?:\/\/(\w+):(.*)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/,
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

export const knexConfig: Knex.Config = {
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

const db = Knex.default(knexConfig);
export default db;

export const cleanupTestDb = async (databaseName: string): Promise<void> => {
  await db.raw(`DROP DATABASE IF EXISTS ${databaseName}`);
};

export async function getTestDb(databaseName: string): Promise<Knex> {
  await cleanupTestDb(databaseName);
  await db.raw(`CREATE DATABASE ${databaseName}`);

  const knexConfigTest: Knex.Config = {
    ...knexConfig,
    connection: {
      ...parseConnectionURI(getDbUrl()),
      database: databaseName,
    },
  };

  return Knex.default(knexConfigTest);
}
