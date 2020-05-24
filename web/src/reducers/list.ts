import { compose } from '@typed/compose';
import {
  createReducerObject,
  Reducer,
  ReducerMap,
  Action,
  PartialReducer,
} from 'create-reducer-object';
import { replaceAtIndex } from 'replace-array';

import { ListActionType, ListItemCreated, ListItemUpdated } from '~client/actions/list';

import { DATA_READ, SYNC_RECEIVED } from '~client/constants/actions/api';
import { LOGGED_OUT } from '~client/constants/actions/login';
import { DataKeyAbbr } from '~client/constants/api';
import { getValueFromTransmit, IDENTITY } from '~client/modules/data';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import {
  RequestWithResponse,
  SyncResponseList,
  SyncResponsePostList,
  SyncResponsePutList,
  SyncResponseDeleteList,
} from '~client/types/api';
import { Page, PageListCalc, PageList } from '~client/types/app';
import { RequestType, Request, IdKey } from '~client/types/crud';
import { Item, ListCalcItem } from '~client/types/list';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CrudItems<I extends Item> = CrudState<I>;

export type ListState<I extends Item, ES extends object = {}> = ES & {
  items: CrudState<I>;
};

const filterByPage = <
  I extends Item,
  ES extends object = {},
  S extends ListState<I, ES> = ListState<I, ES>
>(
  thisPage: Page,
  handler: (state: S, action: Action) => Partial<S>,
) => (state: S, action: Action): Partial<S> => {
  if (action.page !== thisPage) {
    return {};
  }

  return handler(state, action);
};

const onCreate = <I extends Item, ES extends object>(
  page: Page,
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => ({
    ...state,
    items: onCreateOptimistic<I>(state.items, (action as ListItemCreated<I, Page>).delta),
  }));

export const onRead = <I extends Item, R extends {}, ES extends object = {}>(page: Page) => (
  state: ListState<I, ES>,
  action: Action,
): Partial<ListState<I, ES>> => {
  if (!action.res?.[page]) {
    return {};
  }
  if (!action.res[page].data.length) {
    return { ...state, items: [] };
  }

  const dataKeys = Object.entries(DataKeyAbbr).filter(([, shortKey]) =>
    Reflect.has(action.res[page].data[0], shortKey),
  );

  const longKeys = dataKeys.map(([longKey]) => longKey) as (keyof I)[];
  const shortKeys = dataKeys.map(([, shortKey]) => shortKey) as (keyof R)[];

  const items = action.res[page].data.map((item: R) =>
    longKeys.reduce(
      (last, longKey, index) => ({
        ...last,
        [longKey]: getValueFromTransmit(longKey as string, item[shortKeys[index]]),
      }),
      {},
    ),
  );

  return { ...state, items };
};

const onUpdate = <I extends Item, ES extends object>(
  page: Page,
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => ({
    ...state,
    items: onUpdateOptimistic<I>(
      state.items,
      action.id,
      (action as ListItemUpdated<I, Page>).delta,
    ),
  }));

const onDelete = <I extends Item, ES extends object>(
  page: Page,
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => ({
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

const getRequestItems = (page: Page, action: Action): RequestItem[] =>
  (action.res.list as ResponseItem[])
    .map(
      ({ res, ...request }: ResponseItem, index: number): RequestItem => ({
        request,
        index,
        res,
      }),
    )
    .filter(({ request }: RequestItem) => request.route === page);

const onSyncReceived = <I extends Item, ES extends object = {}>(page: Page) => (
  state: ListState<I, ES>,
  action: Action,
): Partial<ListState<I, ES>> => {
  const requestItems = getRequestItems(page, action);

  const items: CrudItems<I> = compose(
    confirmCreates<I>(requestItems),
    confirmUpdates<I>(requestItems),
    confirmDeletes<I>(requestItems),
  )(state.items);

  return { ...state, items };
};

export function makeListReducer<I extends Item, R extends {} = I, ES extends object = {}>(
  page: PageList,
  extraHandlers: ReducerMap<ListState<I, ES>> = {},
  extraState: ES = {} as ES,
): Reducer<ListState<I, ES>> {
  const initialState: ListState<I, ES> = {
    ...extraState,
    items: [],
  };

  const handlers: ReducerMap<ListState<I, ES>> = {
    [LOGGED_OUT]: (): ListState<I, ES> => initialState,
    [ListActionType.created]: onCreate<I, ES>(page),
    [DATA_READ]: onRead<I, R, ES>(page),
    [ListActionType.updated]: onUpdate<I, ES>(page),
    [ListActionType.deleted]: onDelete<I, ES>(page),
    [SYNC_RECEIVED]: onSyncReceived<I, ES>(page),
    ...extraHandlers,
  };

  return createReducerObject(handlers, initialState);
}

type DailyProps = {
  total: number;
  olderExists: boolean | null;
};

export type DailyState<I extends ListCalcItem, ES extends object = {}> = ListState<I, ES> &
  DailyProps;

const withTotals = (
  makeListHandler: <I extends ListCalcItem, ES extends object>(
    page: Page,
  ) => PartialReducer<ListState<I, ES>>,
  getNewTotal: (previousTotal: number, previousItemCost: number, nextItemCost: number) => number,
) => <I extends ListCalcItem, ES extends object = {}>(
  page: Page,
): ((state: DailyState<I, ES>, action: Action) => Partial<DailyState<I, ES>>) => {
  const listHandler = makeListHandler<I, ES>(page);
  return filterByPage<I, ES, DailyState<I, ES>>(
    page,
    (state, action) =>
      ({
        ...listHandler(state, action),
        total: getNewTotal(
          state.total,
          Number(state.items.find(({ id }) => id === action?.id)?.cost ?? 0),
          Number((action as ListItemUpdated<I, Page>)?.delta?.cost ?? 0),
        ),
      } as Partial<DailyState<I, ES>>),
  );
};

const onCreateDaily = withTotals(onCreate, (total, _, cost) => total + cost);

const onReadDaily = <I extends ListCalcItem, R extends {}, ES extends object = {}>(
  page: Page,
): ((state: DailyState<I, ES>, action: Action) => Partial<DailyState<I, ES>>) => {
  const onReadList = onRead<I, R, ES>(page);
  return (state: DailyState<I, ES>, action: Action): Partial<DailyState<I, ES>> => {
    const {
      res: { [page]: pageRes = { total: 0, olderExists: null } },
    } = action;

    const { total, olderExists } = pageRes as DailyProps;

    return { ...onReadList(state, action), total, olderExists } as Partial<DailyState<I, ES>>;
  };
};

const onUpdateDaily = withTotals(
  onUpdate,
  (total, previousCost, nextCost) => total + nextCost - previousCost,
);

const onDeleteDaily = withTotals(onDelete, (total, previousCost) => total - previousCost);

const onSyncReceivedDaily = <I extends ListCalcItem, ES extends object = {}>(
  page: Page,
): ((state: DailyState<I, ES>, action: Action) => Partial<DailyState<I, ES>>) => {
  const onReceivedList = onSyncReceived<I, ES>(page);

  return (state: DailyState<I, ES>, action: Action): Partial<DailyState<I, ES>> => {
    const requestItems = getRequestItems(page, action);

    const total = requestItems.reduce(
      (last, { res: { total: next = last } = {} }) => next,
      state.total,
    );

    return { ...onReceivedList(state, action), total } as Partial<DailyState<I, ES>>;
  };
};

export function makeDailyListReducer<
  I extends ListCalcItem,
  R extends {} = Item,
  ES extends object = {}
>(
  page: PageListCalc,
  extraHandlers: ReducerMap<ListState<I, ES>> = {},
  extraState: ES = {} as ES,
): Reducer<DailyState<I, ES>> {
  const initialState: DailyState<I, ES> = {
    ...extraState,
    items: [],
    total: 0,
    olderExists: null,
  };

  const handlers = {
    [ListActionType.created]: onCreateDaily<I, ES>(page),
    [DATA_READ]: onReadDaily<I, R, ES>(page),
    [ListActionType.updated]: onUpdateDaily<I, ES>(page),
    [ListActionType.deleted]: onDeleteDaily<I, ES>(page),
    [SYNC_RECEIVED]: onSyncReceivedDaily<I, ES>(page),
    ...extraHandlers,
  };

  return makeListReducer<I, R, DailyState<I, ES>>(page, handlers, initialState);
}
