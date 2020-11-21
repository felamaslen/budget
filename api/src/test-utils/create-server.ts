import { Server } from 'http';
import ApolloClient, { PresetConfig, gql } from 'apollo-boost';
import * as Knex from 'knex';
import 'cross-fetch/polyfill';
import { DatabasePoolType } from 'slonik';
import request, { Request } from 'supertest';

import { getTestDb, cleanupTestDb } from './knex';
import { run } from '~api/index';
import { getPool } from '~api/modules/db';
import { Mutation, MutationLoginArgs } from '~api/types';

export type App = {
  db: Knex;
  pool: DatabasePoolType;
  server: Server;
  agent: Agent;
  gqlClient: ApolloClient<unknown>;
  authGqlClient: ApolloClient<unknown>;
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

let portMemo = 4000;

export async function createServer(suffix: string): Promise<App> {
  const databaseName = `budget_test_${suffix}`;
  const port = portMemo;

  portMemo += 1;

  const { db, pool, cleanup: cleanupDb } = await prepareDatabase(databaseName);

  const server = await run(port, databaseName);

  const agent = request.agent(server);

  const gqlClientOptions: PresetConfig = {
    uri: `http://127.0.0.1:${port}/graphql`,
    onError: (err): void => {
      // eslint-disable-next-line no-console
      console.error(err);
    },
  };

  const gqlClient = new ApolloClient(gqlClientOptions);

  const loginRes = await gqlClient.mutate<Mutation, MutationLoginArgs>({
    mutation: gql`
      mutation {
        login(pin: 1234) {
          uid
          apiKey
        }
      }
    `,
  });

  const uid = loginRes.data?.login.uid;
  const apiKey = loginRes.data?.login.apiKey;

  if (!(uid && apiKey)) {
    throw new Error("Couldn't log in prior to integration test");
  }

  const authGqlClient = new ApolloClient({
    ...gqlClientOptions,
    request: (operation): void => {
      operation.setContext({
        headers: {
          Authorization: apiKey,
        },
      });
    },
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
    gqlClient,
    authGqlClient,
    withAuth,
    uid,
    cleanup,
  };
}
