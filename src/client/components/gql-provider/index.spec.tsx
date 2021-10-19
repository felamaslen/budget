import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import gql from 'graphql-tag';
import nock from 'nock';
import fetch from 'node-fetch';
import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from 'urql';

import { MockServer, myApiKey, pubsub } from './__tests__/utils';
import { GQLProvider } from '.';

jest.mock('~client/modules/ssr', () => ({
  isServerSide: false,
}));

describe('GQLProvider', () => {
  let mockFetch: typeof global.fetch;
  const mockServer = new MockServer();

  beforeAll(async () => {
    nock.enableNetConnect('localhost:4000');
    mockFetch = global.fetch;
    global.fetch = fetch as unknown as typeof global.fetch;

    await mockServer.setup();
  });

  afterAll(() => {
    mockServer.teardown();
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

  describe('authenticated queries', () => {
    const testQueryAuth = gql`
      query TestQueryAuth {
        authenticatedHello
      }
    `;

    const TestComponentAuth: React.FC = () => {
      const [resQuery, runTestQuery] = useQuery({
        query: testQueryAuth,
      });

      return (
        <>
          <button onClick={runTestQuery}>Run test query</button>
          <pre data-testid="test-query-data">{JSON.stringify(resQuery.data ?? null)}</pre>
        </>
      );
    };

    describe('when the API key is defined and correct', () => {
      it('should return an authenticated response', async () => {
        expect.hasAssertions();

        const { getByTestId } = render(
          <GQLProvider apiKey={myApiKey}>
            <TestComponentAuth />
          </GQLProvider>,
        );

        await waitFor(() => {
          expect(JSON.parse(getByTestId('test-query-data').innerHTML)).toStrictEqual({
            authenticatedHello: 'You are authorised',
          });
        });
      });
    });

    describe.each`
      case                          | apiKey
      ${'there is no API key'}      | ${''}
      ${'the API key is incorrect'} | ${`NOT-${myApiKey}`}
    `('when $case', ({ apiKey }) => {
      it('should return an unauthorised response', async () => {
        expect.hasAssertions();

        const { getByTestId } = render(
          <GQLProvider apiKey={apiKey}>
            <TestComponentAuth />
          </GQLProvider>,
        );

        await waitFor(() => {
          expect(JSON.parse(getByTestId('test-query-data').innerHTML)).toStrictEqual({
            authenticatedHello: 'Unauthorised',
          });
        });
      });
    });
  });

  describe('when the socket disconnects', () => {
    const ReconnectChild: React.FC<{ connectAttempt: number }> = ({ connectAttempt }) => {
      const [resSubscription, resubscribe] = useSubscription({
        query: testSubscription,
      });

      useEffect(() => {
        if (connectAttempt > 0) {
          resubscribe();
        }
      }, [connectAttempt, resubscribe]);

      return (
        <>
          <span data-testid="subscription-data">
            {JSON.stringify(resSubscription.data ?? null)}
          </span>
        </>
      );
    };

    const ReconnectProvider: React.FC = () => {
      const [connectAttempt, setConnectionAttempt] = useState<number>(0);
      return (
        <GQLProvider apiKey={myApiKey} setConnectionAttempt={setConnectionAttempt}>
          <span data-testid="test-reconnect-attempt">{connectAttempt}</span>
          <ReconnectChild connectAttempt={connectAttempt} />
        </GQLProvider>
      );
    };

    it('should attempt a reconnect, and call onReconnected', async () => {
      expect.hasAssertions();

      // set up reconnect provider
      const subscribeSpy = jest.spyOn(pubsub, 'subscribe');
      const { getByTestId, unmount } = render(<ReconnectProvider />);
      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledTimes(1);
      });

      await axios.post(
        `http://localhost:4000/graphql?query=${encodeURIComponent(
          `mutation TestMutation($index: Int!) { broadcastGreeting(index: $index) { ok } }`,
        )}&variables=${encodeURIComponent(JSON.stringify({ index: 0 }))}`,
      );

      await waitFor(() => {
        expect(JSON.parse(getByTestId('subscription-data').innerHTML)).toStrictEqual({
          greetings: 'Hello',
        });
      });

      expect(getByTestId('test-reconnect-attempt')).toHaveTextContent('0');

      // initiate disconnect/reconnect cycle
      await mockServer.reconnectAfterDelay(200);

      await waitFor(() => {
        expect(getByTestId('test-reconnect-attempt')).toHaveTextContent('1');
      });

      unmount();
    });

    it('should seamlessly restart subscriptions', async () => {
      expect.hasAssertions();

      // set up reconnect provider
      const subscribeSpy = jest.spyOn(pubsub, 'subscribe');
      const { getByTestId, unmount } = render(<ReconnectProvider />);
      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledTimes(1);
      });

      await axios.post(
        `http://localhost:4000/graphql?query=${encodeURIComponent(
          `mutation TestMutation($index: Int!) { broadcastGreeting(index: $index) { ok } }`,
        )}&variables=${encodeURIComponent(JSON.stringify({ index: 0 }))}`,
      );

      await waitFor(() => {
        expect(JSON.parse(getByTestId('subscription-data').innerHTML)).toStrictEqual({
          greetings: 'Hello',
        });
      });

      expect(getByTestId('test-reconnect-attempt')).toHaveTextContent('0');

      // initiate disconnect/reconnect cycle
      await mockServer.reconnectAfterDelay(200);

      await waitFor(() => {
        expect(subscribeSpy).toHaveBeenCalledTimes(2);
      });

      // trigger second subscription update through external mutation
      await axios.post(
        `http://localhost:4000/graphql?query=${encodeURIComponent(
          `mutation TestMutation($index: Int!) { broadcastGreeting(index: $index) { ok } }`,
        )}&variables=${encodeURIComponent(JSON.stringify({ index: 1 }))}`,
      );

      await waitFor(() => {
        expect(JSON.parse(getByTestId('subscription-data').innerHTML)).toStrictEqual({
          greetings: 'Hi',
        });
      });

      unmount();
    });
  });
});
