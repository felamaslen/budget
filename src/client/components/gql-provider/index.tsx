import {
  cacheExchange,
  Client,
  createClient,
  dedupExchange,
  Exchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
} from '@urql/core';
import { createClient as createWSClient, Sink } from 'graphql-ws';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { Provider } from 'urql';

import { isServerSide } from '~client/modules/ssr';

const getWSUrl = (): string => {
  const isSecure = isServerSide ? null : window.location.protocol === 'https:';
  return isServerSide ? '' : `${isSecure ? 'wss' : 'ws'}://${window.location.host}/subscriptions`;
};

export type SSRExchange = ReturnType<typeof ssrExchange>;

type ClientProps = {
  apiKey: string | null;
  setConnectionAttempt?: Dispatch<SetStateAction<number>>;
};

export const ssr = isServerSide
  ? undefined
  : ssrExchange({
      isClient: true,
      initialState: window.__URQL_DATA__,
    });

export const GQLProvider: React.FC<ClientProps> = ({ apiKey, children, setConnectionAttempt }) => {
  const hasConnected = useRef<boolean>(false);
  const onReconnected = useRef<ClientProps['setConnectionAttempt']>(setConnectionAttempt);
  useEffect(
    () => (): void => {
      onReconnected.current = undefined;
    },
    [],
  );

  const client = useMemo<Client>(() => {
    const graphqlUrl = `${window.location.protocol}//${window.location.host}/graphql`;

    if (!apiKey) {
      return createClient({
        url: graphqlUrl,
        exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange].filter(
          (e): e is Exchange => !!e,
        ),
      });
    }

    const wsClient = createWSClient({
      url: getWSUrl(),
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
            onReconnected.current?.((last) => last + 1);
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
