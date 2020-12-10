import { createClient as createWSClient } from 'graphql-ws';
import React, { useContext, useMemo } from 'react';
import { Provider, createClient, defaultExchanges, subscriptionExchange } from 'urql';

import { Spinner } from '~client/components/spinner';
import { ApiContext } from '~client/hooks';

const isSecure = window.location.protocol === 'https:';

type LoggedInProps = { apiKey: string };

const LoggedInWrapper: React.FC = ({ children }) => {
  const apiKey = useContext(ApiContext);

  const wsClient = useMemo(
    () =>
      createWSClient({
        url: `${isSecure ? 'wss' : 'ws'}://${window.location.host}/graphql`,
        connectionParams: {
          apiKey,
        },
      }),
    [apiKey],
  );

  const client = useMemo(
    () =>
      createClient({
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
      }),
    [apiKey, wsClient],
  );

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
