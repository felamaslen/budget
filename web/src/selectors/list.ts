import { compose } from '@typed/compose';
import { createSelector } from 'reselect';

import { PAGES_LIST } from '~client/constants/data';
import { getValueForTransmit } from '~client/modules/data';
import { State } from '~client/reducers';
import { Page, PageList, PageListCalc, Item, RequestType, WithCrud, Request } from '~client/types';

type Params<P extends Page = PageListCalc> = { page: P };

const getNonFilteredItems = (state: State, { page }: Params<PageList>): Item[] => state[page].items;

type NonFilteredItem = {
  page: PageList;
  items: Item[];
};

const getAllNonFilteredItems = (state: State): NonFilteredItem[] =>
  PAGES_LIST.map((page) => ({
    page,
    items: getNonFilteredItems(state, { page }),
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

type ItemPendingRequest<T extends RequestType> = WithCrud<Item> & { __optimistic: T };
const shouldRequest = <T extends RequestType>(requestType: RequestType) => (
  item: WithCrud<Item>,
): item is ItemPendingRequest<T> => item.__optimistic === requestType;

const withCreateRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows
      .filter(shouldRequest<RequestType.create>(RequestType.create))
      .map(({ id, __optimistic: type, ...body }) => ({
        type,
        fakeId: id,
        method: 'post',
        route: page,
        query: {},
        body,
      })),
  );

const withUpdateRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows
      .filter(shouldRequest<RequestType.update>(RequestType.update))
      .map(({ __optimistic: type, ...body }) => ({
        type,
        id: body.id,
        method: 'put',
        route: page,
        query: {},
        body,
      })),
  );

const withDeleteRequests = (page: Page, rows: WithCrud<Item>[]) => (last: Request[]): Request[] =>
  last.concat(
    rows.filter(shouldRequest<RequestType.delete>(RequestType.delete)).map(({ id }) => ({
      type: RequestType.delete,
      id,
      method: 'delete',
      route: page,
      query: {},
      body: { id },
    })),
  );

const getCrudRequestsByPage = (page: Page, items: WithCrud<Item>[]): Request[] =>
  compose(
    withTransmitValues,
    withCreateRequests(page, items),
    withUpdateRequests(page, items),
    withDeleteRequests(page, items),
  )([]);

export const getCrudRequests = createSelector<State, NonFilteredItem[], Request[]>(
  getAllNonFilteredItems,
  (itemsByPage) =>
    itemsByPage.reduce(
      (last: Request[], { page, items }): Request[] =>
        last.concat(getCrudRequestsByPage(page, items)),
      [],
    ),
);
