import { createClient, dedupExchange, cacheExchange, fetchExchange, ssrExchange } from '@urql/core';
import { createClient as createWSClient } from 'graphql-ws';
import React, { useMemo } from 'react';
import { Client, Provider, subscriptionExchange } from 'urql';

import { isServerSide } from '~client/modules/ssr';

const isSecure = isServerSide ? null : window.location.protocol === 'https:';
const wsUrl = isServerSide
  ? ''
  : `${isSecure ? 'wss' : 'ws'}://${window.location.host}/subscriptions`;

export type SSRExchange = ReturnType<typeof ssrExchange>;

type ClientProps = { apiKey: string | null };

export const ssr = isServerSide
  ? undefined
  : ssrExchange({
      isClient: true,
      initialState: window.__URQL_DATA__,
    });

export const GQLProvider: React.FC<ClientProps> = ({ apiKey, children }) => {
  const client = useMemo<Client>(() => {
    if (!apiKey) {
      return createClient({
        url: '/graphql',
        exchanges: [dedupExchange, cacheExchange, ssr as SSRExchange, fetchExchange],
      });
    }

    const wsClient = createWSClient({
      url: wsUrl,
      retryAttempts: Infinity,
      retryWait: (retries): Promise<void> =>
        new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** Math.min(retries, 4))),
      connectionParams: {
        apiKey,
      },
    });

    return createClient({
      url: '/graphql',
      fetchOptions: {
        headers: {
          Authorization: apiKey,
        },
      },
      exchanges: [
        dedupExchange,
        cacheExchange,
        ssr as SSRExchange,
        fetchExchange,
        subscriptionExchange({
          forwardSubscription: (operation) => ({
            subscribe: (sink): { unsubscribe: () => void } => {
              const dispose = wsClient.subscribe(operation, sink);
              return {
                unsubscribe: dispose,
              };
            },
          }),
        }),
      ],
    });
  }, [apiKey]);

  return <Provider value={client}>{children}</Provider>;
};
