import { compose } from '@typed/compose';

import { RequestType, WithCrud, Request, IdKey } from '~client/types/crud';

const filterByType = (type: RequestType, method: Request['method'], idKey: IdKey) => <
  I extends { id: string }
>(
  route: string,
  items: WithCrud<I>[],
) => (requests: Request[]): Request[] =>
  requests.concat(
    items
      .filter(({ __optimistic }) => __optimistic === type)
      .map(({ __optimistic, id, ...body }) => ({
        type,
        [idKey]: id,
        method,
        route,
        body,
      })),
  );

const withCreates = filterByType(RequestType.create, 'post', 'fakeId');

const withUpdates = filterByType(RequestType.update, 'put', 'id');

const withDeletes = <I extends { id: string }>(route: string, items: WithCrud<I>[]) => (
  requests: Request[],
): Request[] =>
  requests.concat(
    items
      .filter(({ __optimistic }) => __optimistic === RequestType.delete)
      .map(
        ({ id }: I): Request => ({
          type: RequestType.delete,
          id,
          method: 'delete',
          route,
        }),
      ),
  );

export const getRequests = <I extends { id: string }>(route: string) => (
  items: WithCrud<I>[],
): Request[] =>
  compose(withCreates(route, items), withUpdates(route, items), withDeletes(route, items))([]);
