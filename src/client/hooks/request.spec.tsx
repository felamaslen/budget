import { act, render, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import React from 'react';

import { useCancellableRequest } from './request';

describe(useCancellableRequest.name, () => {
  type MyQuery = { foo: string } | null;

  beforeEach(() => {
    fetchMock.mockIf(/^http:\/\/localhost\/some\/url\/bar$/, async (req) => {
      if (req.method === 'PUT') {
        return {
          body: JSON.stringify({
            something: 'my-response',
          }),
          headers: { 'Access-Control-Allow-Origin': '*' },
        };
      }

      return { status: 404, body: 'Not Found' };
    });
  });

  const handleResponse = jest.fn();
  const sendRequest = jest.fn().mockImplementation((query: MyQuery): {
    info: RequestInfo;
    init?: RequestInit;
  } => ({
    info: `http://localhost/some/url/${query?.foo}`,
    init: { method: 'PUT' },
  }));

  const TestComponent: React.FC<{ query: MyQuery }> = ({ query }) => {
    useCancellableRequest<MyQuery>({
      query,
      sendRequest,
      handleResponse,
    });
    return null;
  };

  it('should make a request', async () => {
    expect.hasAssertions();
    render(<TestComponent query={{ foo: 'bar' }} />);
    await waitFor(() => {
      expect(sendRequest).toHaveBeenCalledTimes(1);
    });
    expect(sendRequest).toHaveBeenCalledWith({ foo: 'bar' });

    await waitFor(() => {
      expect(handleResponse).toHaveBeenCalledTimes(1);
    });

    expect(handleResponse).toHaveBeenCalledWith(expect.any(Response), { foo: 'bar' });

    const res = handleResponse.mock.calls[0][0] as Response;
    const json = await res.json();

    expect(json).toStrictEqual({ something: 'my-response' });
  });

  describe('when the query is null', () => {
    it('should not make a request', async () => {
      expect.assertions(1);
      sendRequest.mockClear();
      const { unmount } = render(<TestComponent query={null} />);
      expect(sendRequest).not.toHaveBeenCalled();
      act(() => {
        unmount();
      });
    });
  });
});
