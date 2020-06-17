import { compose } from '@typed/compose';

import { State } from '~client/reducers/crud';
import { RequestType, Request, IdKey, Item } from '~client/types';

const filterByType = (type: RequestType, method: Request['method'], idKey: IdKey) => <
  I extends Item
>(
  route: string,
  state: State<I>,
) => (requests: Request[]): Request[] => [
  ...requests,
  ...state.items
    .filter((_, index) => state.__optimistic[index] === type)
    .map<Request>(({ id, ...body }) => ({
      type,
      [idKey]: id,
      method,
      route,
      body,
    })),
];

const withCreates = filterByType(RequestType.create, 'post', 'fakeId');

const withUpdates = filterByType(RequestType.update, 'put', 'id');

const withDeletes = <I extends Item>(route: string, state: State<I>) => (
  requests: Request[],
): Request[] => [
  ...requests,
  ...state.items
    .filter((_, index) => state.__optimistic[index] === RequestType.delete)
    .map<Request>(({ id }) => ({
      type: RequestType.delete,
      id,
      method: 'delete',
      route,
    })),
];

export const getRequests = <I extends Item>(route: string) => (state: State<I>): Request[] =>
  compose(withCreates(route, state), withUpdates(route, state), withDeletes(route, state))([]);

export const withoutDeleted = <I extends Item>(state: State<I>): I[] =>
  state.items.filter((_, index) => state.__optimistic[index] !== RequestType.delete);
