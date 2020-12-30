import React from 'react';
import { Client, Provider } from 'urql';
import 'isomorphic-unfetch';
import { never } from 'wonka';

export const testApiKey = 'my-api-key';

export const mockClient = ({
  executeQuery: jest.fn(() => never),
  executeMutation: jest.fn(() => never),
  executeSubscription: jest.fn(() => never),
} as unknown) as Client;

export const GQLProviderMock: React.FC<{ client?: Client }> = ({
  client = mockClient,
  children,
}) => <Provider value={client}>{children}</Provider>;
