import { Server } from 'http';
import * as Knex from 'knex';
import { DatabasePoolType } from 'slonik';
import request, { Request } from 'supertest';

import { getTestDb, cleanupTestDb } from './knex';
import config from '~api/config';
import { run } from '~api/index';
import { getPool } from '~api/modules/db';

export type App = {
  db: Knex;
  pool: DatabasePoolType;
  server: Server;
  agent: Agent;
  withAuth: WithAuth;
  uid: number;
  cleanup: () => Promise<void>;
};

export async function prepareDatabase(
  databaseName: string,
): Promise<Pick<App, 'db' | 'pool' | 'cleanup'>> {
  const db = await getTestDb(databaseName);
  const pool = getPool(databaseName);

  await db.migrate.latest();
  await db.seed.run();

  const cleanup = async (): Promise<void> => {
    await pool.end();
    await db.destroy();

    await cleanupTestDb(databaseName);
  };

  return { db, pool, cleanup };
}

export async function createServer(suffix: string): Promise<App> {
  const databaseName = `budget_test_${suffix}`;

  const { db, pool, cleanup: cleanupDb } = await prepareDatabase(databaseName);

  const server = await run(config.app.port, databaseName);
  const agent = request.agent(server);

  const {
    body: { uid, apiKey },
  } = await agent.post('/api/v4/user/login').send({
    pin: 1234,
  });

  const withAuth: WithAuth = (req, token = apiKey): Request => req.set('Authorization', token);

  const cleanup = async (): Promise<void> => {
    await new Promise((resolve) => server.close(resolve));
    await cleanupDb();
  };

  return {
    db,
    pool,
    server,
    agent,
    withAuth,
    uid,
    cleanup,
  };
}
