import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { PAGES_LIST } from '~client/constants/data';
import { getValueForTransmit } from '~client/modules/data';
import { State } from '~client/reducers';
import { State as CrudState } from '~client/reducers/crud';
import { Page, PageList, Item, RequestType, Request } from '~client/types';

const getNonFilteredItems = (state: State, page: PageList): CrudState<Item> => ({
  items: state[page].items,
  __optimistic: state[page].__optimistic,
});

type NonFilteredState<I extends Item = Item> = {
  page: PageList;
  state: CrudState<I>;
};

const getAllNonFilteredItems = (state: State): NonFilteredState[] =>
  PAGES_LIST.map<NonFilteredState>((page) => ({
    page,
    state: getNonFilteredItems(state, page),
  }));

const withTransmitValues = (requests: Request[]): Request[] =>
  requests.map(({ body = {}, ...rest }) => ({
    ...rest,
    body: Object.keys(body).reduce(
      (last, column) => ({
        ...last,
        [column]: getValueForTransmit(column, Reflect.get(body, column)),
      }),
      {},
    ),
  }));

const shouldRequest = <T>(__optimistic: (RequestType | undefined)[], requestType: RequestType) => (
  _: T,
  index: number,
): boolean => __optimistic[index] === requestType;

const withCreateRequests = <I extends Item>(page: Page, state: CrudState<I>) => (
  last: Request[],
): Request[] => [
  ...last,
  ...state.items
    .filter(shouldRequest(state.__optimistic, RequestType.create))
    .map<Request>(({ id, ...body }) => ({
      type: RequestType.create,
      fakeId: id,
      method: 'post',
      route: page,
      query: {},
      body,
    })),
];

const withUpdateRequests = <I extends Item>(page: Page, state: CrudState<I>) => (
  last: Request[],
): Request[] => [
  ...last,
  ...state.items
    .filter(shouldRequest(state.__optimistic, RequestType.update))
    .map<Request>((body) => ({
      type: RequestType.update,
      id: body.id,
      method: 'put',
      route: page,
      query: {},
      body,
    })),
];

const withDeleteRequests = <I extends Item>(page: Page, state: CrudState<I>) => (
  last: Request[],
): Request[] => [
  ...last,
  ...state.items
    .filter(shouldRequest(state.__optimistic, RequestType.delete))
    .map<Request>(({ id }) => ({
      type: RequestType.delete,
      id,
      method: 'delete',
      route: page,
      query: {},
      body: { id },
    })),
];

const getCrudRequestsByPage = <I extends Item>(page: Page, state: CrudState<I>): Request[] =>
  compose(
    withTransmitValues,
    withCreateRequests(page, state),
    withUpdateRequests(page, state),
    withDeleteRequests(page, state),
  )([]);

export const getCrudRequests = createSelector<State, NonFilteredState[], Request[]>(
  getAllNonFilteredItems,
  (itemsByPage) =>
    itemsByPage.reduce<Request[]>(
      (last, { page, state }) => [...last, ...getCrudRequestsByPage(page, state)],
      [],
    ),
);
