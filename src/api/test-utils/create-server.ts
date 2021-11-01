import { Server } from 'http';
import {
  cacheExchange,
  Client,
  createClient,
  dedupExchange,
  Exchange,
  fetchExchange,
  subscriptionExchange,
} from '@urql/core';
import axios from 'axios';
import 'cross-fetch/polyfill';
import { Client as WSClient, createClient as createWSClient, Sink } from 'graphql-ws';
import moize from 'moize';
import request, { SuperTest, Test } from 'supertest';
import ws from 'ws';

import { run } from '~api/index';

export type App = {
  agent: SuperTest<Test>;
  gqlClient: Client;
  authGqlClient: Client;
  uid: number;
};

export const testPort = 4000;

export const getServer = (): Promise<Server> => run(testPort);

type TestAppOptions = {
  subscriptions: boolean;
};

export const makeTestApp = async ({
  subscriptions = false,
}: Partial<TestAppOptions> = {}): Promise<App> => {
  if (!global.server) {
    throw new Error('getTestApp called with server uninitialised!');
  }

  const agent = request.agent(global.server);

  const graphqlUrl = `http://127.0.0.1:${testPort}/graphql`;
  const websocketUrl = `ws://127.0.0.1:${testPort}/subscriptions`;

  const loginRes = await axios.post<{
    data?: {
      login: {
        apiKey: string;
        uid: number;
      };
    };
  }>(graphqlUrl, {
    query: `
      mutation {
        login(pin: 1234) {
          apiKey
          uid
        }
      }
    `,
  });

  const uid = loginRes.data.data?.login.uid;
  const cookie = loginRes.headers['set-cookie']?.[0] ?? '';
  const apiKey = loginRes.data.data?.login.apiKey ?? '';

  if (!(uid && cookie && apiKey)) {
    throw new Error("Couldn't log in prior to integration test");
  }

  const anonymousWSClient = subscriptions
    ? createWSClient({
        webSocketImpl: ws,
        url: websocketUrl,
      })
    : undefined;

  const anonymousGqlClient = createClient({
    url: graphqlUrl,
    exchanges: [
      dedupExchange,
      cacheExchange,
      fetchExchange,
      subscriptions &&
        subscriptionExchange({
          forwardSubscription: (operation) => ({
            subscribe: (sink): { unsubscribe: () => void } => {
              const dispose = (anonymousWSClient as WSClient).subscribe(operation, sink as Sink);
              return {
                unsubscribe: dispose,
              };
            },
          }),
        }),
    ].filter((s): s is Exchange => !!s),
  });

  const authWSClient = subscriptions
    ? createWSClient({
        webSocketImpl: ws,
        url: websocketUrl,
        connectionParams: { apiKey },
      })
    : undefined;

  const authGqlClient = createClient({
    url: graphqlUrl,
    fetchOptions: {
      headers: {
        Authorization: apiKey,
      },
    },
    exchanges: [
      dedupExchange,
      cacheExchange,
      fetchExchange,
      subscriptions &&
        subscriptionExchange({
          forwardSubscription: (operation) => ({
            subscribe: (sink): { unsubscribe: () => void } => {
              const dispose = (authWSClient as WSClient).subscribe(operation, sink as Sink);
              return {
                unsubscribe: dispose,
              };
            },
          }),
        }),
    ].filter((s): s is Exchange => !!s),
  });

  return {
    agent,
    gqlClient: anonymousGqlClient,
    authGqlClient,
    uid,
  };
};

export const getTestApp = moize.promise(makeTestApp);
