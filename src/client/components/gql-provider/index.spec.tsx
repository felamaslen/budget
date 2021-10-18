import { Server } from 'http';
import { addResolversToSchema } from '@graphql-tools/schema';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, execute, subscribe } from 'graphql';
import gql from 'graphql-tag';
import { useServer } from 'graphql-ws/lib/use/ws';
import nock from 'nock';
import fetch from 'node-fetch';
import React from 'react';
import { useQuery } from 'urql';
import ws from 'ws';

import { GQLProvider } from '.';

describe('GQLProvider', () => {
  const myApiKey = 'my-api-key';

  // Ripped off the graphql-ws docs
  const greetingsList = ['Hello', 'Hi', 'Bonjour', 'Bienvenido'];
  let greetingIndex = 0;

  const generateGreetings = async (): Promise<{ greetings: string }> => {
    const greetings = greetingsList[greetingIndex % greetingsList.length];
    greetingIndex += 1;
    return { greetings };
  };
  const schema = addResolversToSchema({
    schema: buildSchema(`
    type Query {
      hello: String
    }
    type Subscription {
      greetings: String
    }
    `),
    resolvers: {
      Query: {
        hello: (): string => 'Hello world!',
      },
      Subscription: {
        greetings: generateGreetings,
      },
    },
  });

  const app = express();
  let server: Server;
  let mockFetch: typeof global.fetch;

  beforeAll(async () => {
    nock.enableNetConnect('localhost:4000');
    mockFetch = global.fetch;
    global.fetch = fetch as unknown as typeof global.fetch;
    app.use((_, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      next();
    });
    app.use('/graphql', graphqlHTTP({ schema }));

    await new Promise<void>((resolve, reject) => {
      server = app.listen(4000, () => {
        const wsServer = new ws.Server({
          server,
          path: '/subscriptions',
        });
        useServer({ schema, execute, subscribe }, wsServer);
      });

      server.on('error', reject);
      server.on('listening', resolve);
    });
  });

  afterAll(() => {
    server?.close();
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    Object.defineProperty(process, 'env', {
      value: {
        ...process.env,
        IS_CLIENT: 'true',
      },
    });
    Object.defineProperty(window, 'location', {
      value: {
        host: 'localhost:4000',
        protocol: 'http:',
      },
    });
  });

  const testQuery = gql`
    query TestQuery {
      hello
    }
  `;

  const TestComponent: React.FC = () => {
    const [{ data }, runTestQuery] = useQuery({
      query: testQuery,
      pause: true,
    });

    return (
      <>
        <button onClick={runTestQuery}>Run test query</button>
        <pre data-testid="test-query-data">{JSON.stringify(data ?? null)}</pre>
      </>
    );
  };

  it('should run a basic hello query', async () => {
    expect.hasAssertions();

    const { getByText, getByTestId } = render(
      <GQLProvider apiKey={myApiKey}>
        <TestComponent />
      </GQLProvider>,
    );

    expect(JSON.parse(getByTestId('test-query-data').innerHTML)).toBeNull();

    act(() => {
      userEvent.click(getByText('Run test query'));
    });

    await waitFor(() => {
      expect(JSON.parse(getByTestId('test-query-data').innerHTML)).toStrictEqual({
        hello: 'Hello world!',
      });
    });
  });
});
