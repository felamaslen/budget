import { useContext, useEffect, useRef, useState } from 'react';

import { ApiContext } from './api';
import { useDebouncedState } from './debounce';

type ShouldSendRequest<Query, ValidQuery extends Query> = (
  query: Query | ValidQuery,
) => query is ValidQuery;

export type SendRequest<Query> = (query: Query) => { info: RequestInfo; init?: RequestInit };

type Options<Query, ValidQuery extends Query> = {
  query: Query;
  sendRequest: SendRequest<ValidQuery>;
  shouldSendRequest?: ShouldSendRequest<Query, ValidQuery>;
  handleResponse: (res: Response, query: ValidQuery) => void;
  onError?: (err: Error) => void;
  onClear?: () => void;
  debounceDelay?: number;
};

const isRequestTruthy = <Query, ValidQuery extends Query>(
  query: Query | ValidQuery,
): query is ValidQuery => !!query;

export function useCancellableRequest<Query, ValidQuery extends Query = Query>({
  query,
  sendRequest,
  shouldSendRequest = isRequestTruthy as ShouldSendRequest<Query, ValidQuery>,
  handleResponse,
  onError,
  onClear,
  debounceDelay = 100,
}: Options<Query, ValidQuery>): boolean {
  const [, debouncedQuery, setDebouncedQuery] = useDebouncedState<Query>(query, debounceDelay);
  useEffect(() => {
    setDebouncedQuery(query);
  }, [query, setDebouncedQuery]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiKey = useContext(ApiContext);

  const abortController = useRef<AbortController>();

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

        const controller = new AbortController();
        abortController.current = controller;

        const { signal } = controller;

        const { info, init = {} } = sendRequest(debouncedQuery);

        const res = await fetch(info, {
          ...init,
          headers: {
            authorization: apiKey,
          },
          signal,
        });

        if (cancelled) {
          return;
        }

        handleResponse(res, debouncedQuery);
      } catch (err) {
        if (err.name !== 'AbortError') {
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
      abortController.current?.abort();
    };
  }, [sendRequest, handleResponse, onError, shouldSendRequest, debouncedQuery, apiKey]);

  return loading;
}
