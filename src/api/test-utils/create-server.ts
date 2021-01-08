import { Server } from 'http';
import ApolloClient, { PresetConfig } from 'apollo-boost';
import axios from 'axios';
import 'cross-fetch/polyfill';
import * as Knex from 'knex';
import moize from 'moize';
import request, { SuperTest, Test } from 'supertest';

import { db } from './knex';
import { run } from '~api/index';

export type App = {
  db: Knex;
  agent: SuperTest<Test>;
  gqlClient: ApolloClient<unknown>;
  authGqlClient: ApolloClient<unknown>;
  uid: number;
};

export const testPort = 4000;

export const getServer = (): Promise<Server> => run(testPort);

export const getTestApp = moize.promise(
  async (): Promise<App> => {
    if (!global.server) {
      throw new Error('getTestApp called with server uninitialised!');
    }

    const agent = request.agent(global.server);

    const graphqlUrl = `http://127.0.0.1:${testPort}/graphql`;

    const gqlClientOptions: PresetConfig = {
      uri: graphqlUrl,
      onError: (err): void => {
        // eslint-disable-next-line no-console
        console.error(err);
      },
    };

    const gqlClient = new ApolloClient(gqlClientOptions);

    let cookie = '';

    const authGqlClient = new ApolloClient({
      ...gqlClientOptions,
      request: (operation): void => {
        operation.setContext({
          headers: {
            Cookie: cookie,
          },
        });
      },
    });

    const loginRes = await axios.post(graphqlUrl, {
      query: `
        mutation {
          login(pin: 1234) {
            uid
          }
        }
      `,
    });

    cookie = loginRes.headers['set-cookie']?.[0] ?? '';

    const uid = loginRes.data.data?.login.uid;

    if (!uid) {
      throw new Error("Couldn't log in prior to integration test");
    }

    return {
      db,
      agent,
      gqlClient,
      authGqlClient,
      uid,
    };
  },
);