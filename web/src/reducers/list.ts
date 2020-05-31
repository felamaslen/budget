import { compose } from '@typed/compose';
import { Reducer } from 'redux';
import { replaceAtIndex } from 'replace-array';

import * as Actions from '~client/actions';
import { DataKeyAbbr } from '~client/constants/api';
import { getValueFromTransmit, IDENTITY } from '~client/modules/data';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import {
  SyncResponseList,
  SyncResponsePostList,
  SyncResponsePutList,
  SyncResponseDeleteList,
  Request,
  RequestWithResponse,
  RequestType,
  IdKey,
  Page,
  PageList,
  PageListCalc,
  Item,
  ListItem,
  ListCalcItem,
  ReadResponse,
} from '~client/types';

type CrudItems<I extends Item> = CrudState<I>;

type FullReducer<S, A> = (state: S, action: A) => S;

export type ListState<I extends Item, ES extends object = {}> = ES & {
  items: CrudState<I>;
};

const filterByPage = <
  I extends ListItem,
  P extends PageList,
  S extends ListState<I> = ListState<I>,
  AP extends Actions.ActionList<I, P> = Actions.ActionList<I, P>,
  AG extends Actions.ActionList<ListItem, PageList> = Actions.ActionList<ListItem, PageList>
>(
  thisPage: Page,
  handler: (state: S, action: AP) => S,
): FullReducer<S, AG> => {
  const actionIsForPage = (action: AG | AP): action is AP => action.page === thisPage;

  return (state, action): S => (actionIsForPage(action) ? handler(state, action) : state);
};

const onCreate = <I extends ListItem, P extends PageList, ES extends object>(
  page: Page,
): FullReducer<ListState<I, ES>, Actions.ActionList<ListItem, PageList>> =>
  filterByPage<I, P, ListState<I, ES>, Actions.ListItemCreated<I, P>>(page, (state, action) => ({
    ...state,
    items: onCreateOptimistic<I>(state.items, action.delta),
  }));

export const onRead = <I extends Item, P extends PageList, ES extends object>(page: P) => (
  state: ListState<I, ES>,
  action: Actions.ActionApiDataRead,
): ListState<I, ES> => {
  if (!action.res?.[page]) {
    return state;
  }
  if (!action.res[page]?.data.length) {
    return { ...state, items: [] };
  }

  const dataKeys = Object.entries(DataKeyAbbr).filter(([, shortKey]) =>
    Reflect.has(action.res[page]?.data[0] ?? {}, shortKey),
  );

  type RawItem = ReadResponse[P]['data'][0];
  const rawItems: RawItem[] = action.res[page]?.data ?? [];

  const longKeys = dataKeys.map(([longKey]) => longKey) as (keyof I)[];
  const shortKeys = dataKeys.map(([, shortKey]) => shortKey) as (keyof RawItem)[];

  const items = rawItems.map((item: RawItem) =>
    longKeys.reduce<I>(
      (last, longKey, index) => ({
        ...last,
        [longKey]: getValueFromTransmit(longKey as string, item[shortKeys[index]]),
      }),
      {} as I,
    ),
  );

  return { ...state, items };
};

const onUpdate = <I extends ListItem, P extends PageList, ES extends object>(
  page: Page,
): FullReducer<ListState<I, ES>, Actions.ListItemUpdated<ListItem, PageList>> =>
  filterByPage<I, P, ListState<I, ES>, Actions.ListItemUpdated<I, P>>(page, (state, action) => ({
    ...state,
    items: onUpdateOptimistic<I>(state.items, action.id, action.delta),
  }));

const onDelete = <I extends ListItem, P extends PageList, ES extends object>(
  page: Page,
): FullReducer<ListState<I, ES>, Actions.ListItemDeleted<ListItem, PageList>> =>
  filterByPage<I, P, ListState<I, ES>, Actions.ListItemDeleted<I, P>>(page, (state, action) => ({
    ...state,
    items: onDeleteOptimistic<I>(state.items, action.id),
  }));

type RequestItem<R extends SyncResponseList = SyncResponseList> = {
  request: Request;
  index: number;
  res: R;
};

type ResponseItem<R extends SyncResponseList = SyncResponseList> = RequestItem['request'] &
  Pick<RequestWithResponse<R>, 'res'>;

type FilteredRequestItem<R extends SyncResponseList> = RequestItem<R> & {
  listIndex: number;
};

type PostProcess<I extends Item, R extends SyncResponseList> = (
  items: CrudItems<I>,
  filteredRequestItems: FilteredRequestItem<R>[],
) => CrudItems<I>;

type FilterRequestItems<I extends Item> = (items: CrudItems<I>) => CrudItems<I>;

function filterRequestItems<I extends Item, R extends SyncResponseList>(
  requestItems: RequestItem[],
  requestType: RequestType,
  postProcess: PostProcess<I, R> = IDENTITY,
  idKey: IdKey = 'id',
): FilterRequestItems<I> {
  return (items: CrudItems<I>): CrudItems<I> =>
    postProcess(
      items,
      requestItems
        .filter(
          (requestItem: RequestItem): requestItem is RequestItem<R> =>
            requestItem.request.type === requestType,
        )
        .map(
          ({ request, index, res }): FilteredRequestItem<R> => ({
            request,
            index,
            res,
            listIndex: items.findIndex(
              ({ id, __optimistic }) => __optimistic === requestType && id === request[idKey],
            ),
          }),
        ),
    );
}

const confirmCreates = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems<I, SyncResponsePostList>(
    requestItems,
    RequestType.create,
    (items, filteredRequestItems): CrudItems<I> =>
      filteredRequestItems.reduce(
        (last, { res, listIndex }) =>
          replaceAtIndex(last, listIndex, (value) => ({
            ...value,
            id: res.id,
            __optimistic: undefined,
          })),
        items,
      ),
    'fakeId',
  );

const confirmUpdates = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems<I, SyncResponsePutList>(
    requestItems,
    RequestType.update,
    (items, filteredRequestItems): CrudItems<I> =>
      filteredRequestItems.reduce(
        (last, { listIndex }) =>
          replaceAtIndex(last, listIndex, (value) => ({
            ...value,
            __optimistic: undefined,
          })),
        items,
      ),
  );

const confirmDeletes = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems<I, SyncResponseDeleteList>(
    requestItems,
    RequestType.delete,
    (items, filteredRequestItems) => {
      const idsToDelete = filteredRequestItems.map(({ request: { id } }) => id);
      return items.filter(({ id }) => !idsToDelete.includes(id));
    },
  );

const getRequestItems = (page: Page, action: Actions.ActionApiSyncReceived): RequestItem[] =>
  (action.res.list as ResponseItem[])
    .map(
      ({ res, ...request }: ResponseItem, index: number): RequestItem => ({
        request,
        index,
        res,
      }),
    )
    .filter(({ request }: RequestItem) => request.route === page);

const onSyncReceived = <I extends ListItem, P extends Page, ES extends object>(page: P) => (
  state: ListState<I, ES>,
  action: Actions.ActionApiSyncReceived,
): ListState<I, ES> => {
  const requestItems = getRequestItems(page, action);

  const items: CrudItems<I> = compose(
    confirmCreates<I>(requestItems),
    confirmUpdates<I>(requestItems),
    confirmDeletes<I>(requestItems),
  )(state.items);

  return { ...state, items };
};

export function makeListReducer<I extends ListItem, P extends PageList, ES extends object = {}>(
  page: P,
  extraState: ES = {} as ES,
): Reducer<ListState<I, ES>, Actions.Action> {
  const initialState: ListState<I, ES> = {
    ...extraState,
    items: [],
  };

  const handlerCreate = onCreate<I, P, ES>(page);
  const handlerRead = onRead<I, P, ES>(page);
  const handlerUpdate = onUpdate<I, P, ES>(page);
  const handlerDelete = onDelete<I, P, ES>(page);

  const handlerSyncReceived = onSyncReceived<I, P, ES>(page);

  return function listReducer(state = initialState, action): ListState<I, ES> {
    switch (action.type) {
      case Actions.ListActionType.Created:
        return handlerCreate(state, action);
      case Actions.ActionTypeApi.DataRead:
        return handlerRead(state, action);
      case Actions.ListActionType.Updated:
        return handlerUpdate(state, action);
      case Actions.ListActionType.Deleted:
        return handlerDelete(state, action);

      case Actions.ActionTypeApi.SyncReceived:
        return handlerSyncReceived(state, action);

      case Actions.ActionTypeLogin.LoggedOut:
        return initialState;
      default:
        return state;
    }
  };
}

type DailyProps = {
  total: number;
  olderExists: boolean | null;
};

export type DailyState<I extends ListCalcItem, ES extends object = {}> = ListState<I, ES> &
  DailyProps;

const isUpdateDelete = <I extends ListItem, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemUpdated<I, PageList> | Actions.ListItemDeleted<I, PageList>,
): action is Actions.ListItemUpdated<I, PageList> | Actions.ListItemDeleted<I, PageList> =>
  Reflect.has(action, 'id');

const isCreateUpdate = <I extends ListItem, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemCreated<I, PageList> | Actions.ListItemUpdated<I, PageList>,
): action is Actions.ListItemCreated<I, PageList> | Actions.ListItemUpdated<I, PageList> =>
  Reflect.has(action, 'delta');

const isCreate = <I extends ListItem, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemCreated<I, PageList>,
): action is Actions.ListItemCreated<I, PageList> => Reflect.has(action, 'fakeId');

const getItemCostWithId = <I extends ListCalcItem>(state: DailyState<I>, id: string): number =>
  state.items.find((item) => item.id === id)?.cost ?? 0;

const getPreviousItemCost = <I extends ListCalcItem, A extends Actions.ActionList<I, PageListCalc>>(
  state: DailyState<I>,
  action: A,
): number => (isUpdateDelete(action) ? getItemCostWithId(state, action.id) : 0);

const getNextItemCost = <I extends ListCalcItem, A extends Actions.ActionList<I, PageListCalc>>(
  state: DailyState<I>,
  action: A,
): number => {
  if (!isCreateUpdate(action)) {
    return 0;
  }
  return action.delta.cost ?? (isCreate(action) ? 0 : getItemCostWithId(state, action.id));
};

const withTotals = <
  I extends ListCalcItem,
  P extends PageListCalc,
  ES extends object,
  AP extends Actions.ActionList<I, P>,
  AG extends Actions.ActionList<ListItem, PageList>
>(
  page: P,
  makeListHandler: (page: P) => FullReducer<ListState<I>, AP>,
  getNewTotal: (previousTotal: number, previousItemCost: number, nextItemCost: number) => number,
): FullReducer<DailyState<I, ES>, AG> => {
  const listHandler = makeListHandler(page);
  return filterByPage<I, P, DailyState<I, ES>, AP, AG>(page, (state, action) => {
    return {
      ...state,
      ...listHandler(state, action),
      total: getNewTotal(
        state.total,
        getPreviousItemCost(state, action),
        getNextItemCost(state, action),
      ),
    };
  });
};

const makeOnReadDaily = <I extends ListCalcItem, P extends PageListCalc, ES extends object>(
  page: P,
): FullReducer<DailyState<I, ES>, Actions.ActionApiDataRead> => {
  const onReadList = onRead<I, P, ES>(page);
  return (state, action): DailyState<I, ES> => {
    const {
      res: { [page]: pageRes = { total: 0, olderExists: null } },
    } = action;

    const { total, olderExists } = pageRes as DailyProps;

    return { ...state, ...onReadList(state, action), total, olderExists };
  };
};

const makeOnSyncReceivedDaily = <I extends ListCalcItem, P extends PageListCalc, ES extends object>(
  page: P,
): FullReducer<DailyState<I, ES>, Actions.ActionApiSyncReceived> => {
  const onReceivedList = onSyncReceived<I, P, ES>(page);

  return (state, action): DailyState<I, ES> => {
    const requestItems = getRequestItems(page, action);

    const total = requestItems.reduce(
      (last, { res: { total: next = last } = {} }) => next,
      state.total,
    );

    return { ...state, ...onReceivedList(state, action), total };
  };
};

export function makeDailyListReducer<
  I extends ListCalcItem,
  P extends PageListCalc,
  ES extends object = {}
>(page: P, extraState: ES = {} as ES): Reducer<DailyState<I, ES>, Actions.Action> {
  const initialState: DailyState<I, ES> = {
    ...extraState,
    items: [],
    total: 0,
    olderExists: null,
  };

  const onCreateDaily = withTotals<
    I,
    P,
    ES,
    Actions.ListItemCreated<I, P>,
    Actions.ListItemCreated<ListItem, PageList>
  >(page, onCreate, (total, _, cost) => total + cost);

  const onReadDaily = makeOnReadDaily<I, P, ES>(page);

  const onUpdateDaily = withTotals<
    I,
    P,
    ES,
    Actions.ListItemUpdated<I, P>,
    Actions.ListItemUpdated<ListItem, PageList>
  >(page, onUpdate, (total, previousCost, nextCost) => total + nextCost - previousCost);

  const onDeleteDaily = withTotals<
    I,
    P,
    ES,
    Actions.ListItemDeleted<I, P>,
    Actions.ListItemDeleted<ListItem, PageList>
  >(page, onDelete, (total, previousCost) => total - previousCost);

  const onSyncReceivedDaily = makeOnSyncReceivedDaily<I, P, ES>(page);

  const baseListReducer = makeListReducer<I, P, DailyState<I, ES>>(page, initialState);

  return function dailyListReducer(state = initialState, action): DailyState<I, ES> {
    switch (action.type) {
      case Actions.ListActionType.Created:
        return onCreateDaily(state, action);
      case Actions.ActionTypeApi.DataRead:
        return onReadDaily(state, action);
      case Actions.ListActionType.Updated:
        return onUpdateDaily(state, action);
      case Actions.ListActionType.Deleted:
        return onDeleteDaily(state, action);

      case Actions.ActionTypeApi.SyncReceived:
        return onSyncReceivedDaily(state, action);
      default:
        return baseListReducer(state, action);
    }
  };
}
