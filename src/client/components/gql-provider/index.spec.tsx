import { Server } from 'http';
import { addResolversToSchema } from '@graphql-tools/schema';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema, execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import gql from 'graphql-tag';
import { useServer } from 'graphql-ws/lib/use/ws';
import nock from 'nock';
import fetch from 'node-fetch';
import React from 'react';
import { useQuery, useSubscription } from 'urql';
import ws from 'ws';

import { GQLProvider } from '.';

describe('GQLProvider', () => {
  const myApiKey = 'my-api-key';

  const pubsub = new PubSub();
  const TEST_PUBSUB_TOPIC = 'TEST_PUBSUB_TOPIC';

  // Ripped off the graphql-ws docs
  const greetingsList = ['Hello', 'Hi', 'Bonjour', 'Bienvenido'];

  const schema = addResolversToSchema({
    schema: buildSchema(`
    type BroadcastGreeting {
      ok: Boolean!
    }
    type Query {
      hello: String
    }
    type Mutation {
      broadcastGreeting(index: Int!): BroadcastGreeting
    }
    type Subscription {
      greetings: String
    }
    `),
    resolvers: {
      Query: {
        hello: (): string => 'Hello world!',
      },
      Mutation: {
        broadcastGreeting: (_, { index }): { ok: boolean } => {
          pubsub.publish(TEST_PUBSUB_TOPIC, greetingsList[index % greetingsList.length]);
          return { ok: true };
        },
      },
      Subscription: {
        greetings: {
          subscribe: (): AsyncIterator<void> => pubsub.asyncIterator(TEST_PUBSUB_TOPIC),
          resolve: (payload): unknown => payload,
        },
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

  const testSubscription = gql`
    subscription TestSubscription {
      greetings
    }
  `;

  const TestComponent: React.FC = () => {
    const [resQuery, runTestQuery] = useQuery({
      query: testQuery,
      pause: true,
    });

    const [resSubscription] = useSubscription({
      query: testSubscription,
    });

    return (
      <>
        <button onClick={runTestQuery}>Run test query</button>
        <pre data-testid="test-query-data">{JSON.stringify(resQuery.data ?? null)}</pre>
        <pre data-testid="test-subscription-data">
          {JSON.stringify(resSubscription.data ?? null)}
        </pre>
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

  it('should receive a subscription initiated by external mutation', async () => {
    expect.hasAssertions();

    const subscribeSpy = jest.spyOn(pubsub, 'subscribe');

    const { getByTestId } = render(
      <GQLProvider apiKey={myApiKey}>
        <TestComponent />
      </GQLProvider>,
    );

    await waitFor(() => {
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
    });

    expect(JSON.parse(getByTestId('test-subscription-data').innerHTML)).toBeNull();

    await axios.post(
      `http://localhost:4000/graphql?query=${encodeURIComponent(
        `mutation TestMutation($index: Int!) { broadcastGreeting(index: $index) { ok } }`,
      )}&variables=${encodeURIComponent(JSON.stringify({ index: 1 }))}`,
    );

    await waitFor(() => {
      expect(JSON.parse(getByTestId('test-subscription-data').innerHTML)).toStrictEqual({
        greetings: 'Hi',
      });
    });

    await axios.post(
      `http://localhost:4000/graphql?query=${encodeURIComponent(
        `mutation TestMutation($index: Int!) { broadcastGreeting(index: $index) { ok } }`,
      )}&variables=${encodeURIComponent(JSON.stringify({ index: 3 }))}`,
    );

    await waitFor(() => {
      expect(JSON.parse(getByTestId('test-subscription-data').innerHTML)).toStrictEqual({
        greetings: 'Bienvenido',
      });
    });
  });
});
