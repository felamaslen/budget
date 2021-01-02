import axios, { Canceler, AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { ApiContext } from './api';
import { useDebouncedState } from './debounce';

type ShouldSendRequest<Query, ValidQuery extends Query> = (
  query: Query | ValidQuery,
) => query is ValidQuery;

type Options<Query, Response, ValidQuery extends Query> = {
  query: Query;
  sendRequest: (
    axiosInstance: AxiosInstance,
    query: ValidQuery,
  ) => Promise<AxiosResponse<Response>>;
  shouldSendRequest?: ShouldSendRequest<Query, ValidQuery>;
  handleResponse: (res: Response, query: ValidQuery) => void;
  onError?: (err: Error) => void;
  onClear?: () => void;
  debounceDelay?: number;
};

const isRequestTruthy = <Query, ValidQuery extends Query>(
  query: Query | ValidQuery,
): query is ValidQuery => !!query;

export function useCancellableRequest<Query, Response = void, ValidQuery extends Query = Query>({
  query,
  sendRequest,
  shouldSendRequest = isRequestTruthy as ShouldSendRequest<Query, ValidQuery>,
  handleResponse,
  onError,
  onClear,
  debounceDelay = 100,
}: Options<Query, Response, ValidQuery>): boolean {
  const [, debouncedQuery, setDebouncedQuery] = useDebouncedState<Query>(query, debounceDelay);
  useEffect(() => {
    setDebouncedQuery(query);
  }, [query, setDebouncedQuery]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiKey = useContext(ApiContext);

  const cancelRequest = useRef<Canceler>();
  const axiosWithToken = useCallback(
    (): AxiosInstance =>
      axios.create({
        headers: {
          authorization: apiKey,
        },
        cancelToken: new axios.CancelToken((token): void => {
          cancelRequest.current = token;
        }),
      }),
    [apiKey],
  );

  useEffect(() => {
    setLoading(!!query);
    if (onClear && !query) {
      onClear();
    }
  }, [query, onClear]);

  useEffect(() => {
    let cancelled = false;
    const request = async (): Promise<void> => {
      try {
        if (!shouldSendRequest(debouncedQuery)) {
          return;
        }

        const res = await sendRequest(axiosWithToken(), debouncedQuery);
        if (cancelled) {
          return;
        }

        handleResponse(res.data, debouncedQuery);
      } catch (err) {
        if (!axios.isCancel(err)) {
          onError?.(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    request();

    return (): void => {
      cancelled = true;
      if (cancelRequest.current) {
        cancelRequest.current();
      }
    };
  }, [axiosWithToken, sendRequest, handleResponse, onError, shouldSendRequest, debouncedQuery]);

  return loading;
}
