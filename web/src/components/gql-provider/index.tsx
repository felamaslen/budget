import { createClient as createWSClient } from 'graphql-ws';
import moize from 'moize';
import React, { useContext } from 'react';
import { Client, createClient, defaultExchanges, Provider, subscriptionExchange } from 'urql';

import { Spinner } from '~client/components/spinner';
import { ApiContext } from '~client/hooks';

const isSecure = window.location.protocol === 'https:';
const wsUrl = `${isSecure ? 'wss' : 'ws'}://${window.location.host}/graphql`;

type LoggedInProps = { apiKey: string };

const getClient = moize(
  (apiKey: string): Client => {
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
        ...defaultExchanges,
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
  },
  { maxSize: 1 },
);

const LoggedInWrapper: React.FC = ({ children }) => {
  const apiKey = useContext(ApiContext);
  const client = getClient(apiKey);

  if (!client) {
    return <Spinner cover />;
  }

  return (
    <Provider value={client}>
      <ApiContext.Provider value={apiKey}>{children}</ApiContext.Provider>
    </Provider>
  );
};

export const GQLProviderLoggedIn: React.FC<LoggedInProps> = ({ apiKey, children }) => (
  <ApiContext.Provider value={apiKey}>
    <LoggedInWrapper>{children}</LoggedInWrapper>
  </ApiContext.Provider>
);

const anonymousClient = createClient({
  url: '/graphql',
});

export const GQLProviderAnonymous: React.FC = ({ children }) => (
  <Provider value={anonymousClient}>{children}</Provider>
);
