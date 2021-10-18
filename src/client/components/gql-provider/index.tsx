import {
  Client,
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
  Exchange,
} from '@urql/core';
import { createClient as createWSClient, Sink } from 'graphql-ws';
import React, { useMemo, useRef } from 'react';
import { Provider } from 'urql';

import { getIsServerSide } from '~client/modules/ssr';

function getWSUrl(): string {
  const isServerSide = getIsServerSide();
  const isSecure = isServerSide ? null : window.location.protocol === 'https:';
  return isServerSide ? '' : `${isSecure ? 'wss' : 'ws'}://${window.location.host}/subscriptions`;
}

export type SSRExchange = ReturnType<typeof ssrExchange>;

type ClientProps = { apiKey: string | null; onReconnected?: () => void };

export const GQLProvider: React.FC<ClientProps> = ({ apiKey, children, onReconnected }) => {
  const hasConnected = useRef<boolean>(false);
  const graphqlUrl = `${window.location.protocol}//${window.location.host}/graphql`;
  const wsUrl = getWSUrl();
  const ssr = useMemo(
    () =>
      getIsServerSide()
        ? undefined
        : ssrExchange({
            isClient: true,
            initialState: window.__URQL_DATA__,
          }),
    [],
  );

  const client = useMemo<Client>(() => {
    if (!apiKey) {
      return createClient({
        url: graphqlUrl,
        exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange].filter(
          (e): e is Exchange => !!e,
        ),
      });
    }

    const wsClient = createWSClient({
      url: wsUrl,
      lazy: false,
      retryAttempts: Infinity,
      retryWait: (retries): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** Math.min(retries, 4))),
      connectionParams: {
        apiKey,
      },
      on: {
        connected: (): void => {
          if (hasConnected.current) {
            onReconnected?.();
          }
          hasConnected.current = true;
        },
      },
    });

    return createClient({
      url: graphqlUrl,
      fetchOptions: {
        headers: {
          Authorization: apiKey,
        },
      },
      exchanges: [
        dedupExchange,
        cacheExchange,
        ssr,
        fetchExchange,
        subscriptionExchange({
          forwardSubscription: (operation) => ({
            subscribe: (sink): { unsubscribe: () => void } => {
              const dispose = wsClient.subscribe(operation, sink as Sink);
              return {
                unsubscribe: dispose,
              };
            },
          }),
        }),
      ].filter((e): e is Exchange => !!e),
    });
  }, [apiKey, onReconnected]);

  return <Provider value={client}>{children}</Provider>;
};
