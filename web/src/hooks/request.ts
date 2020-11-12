import axios, { Canceler, AxiosInstance, AxiosResponse } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';

import { State } from '~client/reducers';

export const maybeGetApiKey = <S extends Partial<Pick<State, 'api'>>>(state: S): string | null =>
  state.api?.key ?? null;

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
  onClear,
  debounceDelay = 100,
}: Options<Query, Response, ValidQuery>): boolean {
  const [debouncedQuery] = useDebounce(query, debounceDelay);
  const [loading, setLoading] = useState<boolean>(false);

  const apiKey = useSelector<State>(maybeGetApiKey);

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
          throw err;
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
  }, [axiosWithToken, sendRequest, handleResponse, shouldSendRequest, debouncedQuery]);

  return loading;
}
