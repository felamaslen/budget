import { Server } from 'http';
import ApolloClient, { PresetConfig, gql } from 'apollo-boost';
import 'cross-fetch/polyfill';
import * as Knex from 'knex';
import moize from 'moize';
import request, { SuperTest, Test } from 'supertest';

import { db } from './knex';
import { run } from '~api/index';
import { Mutation, MutationLoginArgs } from '~api/types';

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

    const gqlClientOptions: PresetConfig = {
      uri: `http://127.0.0.1:${testPort}/graphql`,
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

    return {
      db,
      agent,
      gqlClient,
      authGqlClient,
      uid,
    };
  },
);
