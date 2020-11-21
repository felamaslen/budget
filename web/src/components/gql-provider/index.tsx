import React from 'react';
import { Provider, createClient } from 'urql';

const client = createClient({
  url: '/graphql',
});

export const GQLProvider: React.FC = ({ children }) => (
  <Provider value={client}>{children}</Provider>
);
