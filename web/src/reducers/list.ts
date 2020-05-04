import { compose } from '@typed/compose';
import {
  createReducerObject,
  Reducer,
  ReducerMap,
  Action,
  PartialReducer,
} from 'create-reducer-object';
import { replaceAtIndex } from 'replace-array';

import {
  LIST_ITEM_CREATED,
  LIST_ITEM_UPDATED,
  LIST_ITEM_DELETED,
} from '~client/constants/actions/list';

import { Page, PageListCalc, PageList } from '~client/types/app';
import { RequestType, Create, Request } from '~client/types/crud';
import { getColumns, Item, ListCalcItem } from '~client/types/list';
import { LOGGED_OUT } from '~client/constants/actions/login';
import { DATA_READ, SYNC_RECEIVED } from '~client/constants/actions/api';

import { DataKeyAbbr } from '~client/constants/data';
import { getValueFromTransmit, fieldExists } from '~client/modules/data';

import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';

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

const filterExtraProps = <I extends object>(
  item: Create<I>,
  columns: (keyof Create<I>)[],
): Create<I> =>
  (Object.keys(item) as (keyof Create<I>)[])
    .filter(column => columns.includes(column))
    .reduce((last, column) => ({ ...last, [column]: item[column] }), {} as Create<I>);

const onCreate = <I extends Item, ES extends object>(
  page: Page,
  columns: (keyof Create<I>)[],
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => {
    const newItem: Partial<Create<I>> = action.item;
    if (columns.some(column => !fieldExists(newItem[column]))) {
      return state;
    }

    return {
      items: onCreateOptimistic<I>(state.items, filterExtraProps<I>(action.item, columns)),
    } as Partial<ListState<I, ES>>;
  });

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
  columns: (keyof Create<I>)[],
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => ({
    ...state,
    items: onUpdateOptimistic<I>(state.items, action.id, filterExtraProps<I>(action.item, columns)),
  }));

const onDelete = <I extends Item, ES extends object>(
  page: Page,
): PartialReducer<ListState<I, ES>> =>
  filterByPage<I, ES>(page, (state, action) => ({
    ...state,
    items: onDeleteOptimistic<I>(state.items, action.id),
  }));

type Res = {
  id: string;
  total?: number;
};

type RequestItem = {
  request: Request;
  index: number;
  res: Res;
};

type ResponseItem = RequestItem['request'] & {
  res: Res;
};

type PostProcess<I extends Item> = (
  items: CrudItems<I>,
  filteredRequestItems: RequestItemWithListIndex[],
) => CrudItems<I>;

type RequestItemWithListIndex = RequestItem & {
  listIndex: number;
};

type FilterRequestItems<I extends Item> = (items: CrudItems<I>) => CrudItems<I>;

function filterRequestItems<I extends Item>(
  requestItems: RequestItem[],
  requestType: RequestType,
  postProcess: PostProcess<I>,
  idKey: 'id' | 'fakeId' = 'id',
): FilterRequestItems<I> {
  return (items: CrudItems<I>): CrudItems<I> =>
    postProcess(
      items,
      requestItems
        .filter(({ request: { type } }) => type === requestType)
        .map(
          ({ request, index, res }): RequestItemWithListIndex => ({
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

const withCreatedIds = <I extends Item>(
  items: CrudItems<I>,
  requestItems: RequestItemWithListIndex[],
): CrudItems<I> =>
  requestItems.reduce(
    (last, { res, listIndex }: RequestItemWithListIndex) =>
      replaceAtIndex(last, listIndex, value => ({
        ...value,
        id: res.id || value.id,
        __optimistic: undefined,
      })),
    items,
  );

const confirmCreates = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems<I>(requestItems, RequestType.create, withCreatedIds, 'fakeId');

const confirmUpdates = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems(requestItems, RequestType.update, withCreatedIds);

const confirmDeletes = <I extends Item>(requestItems: RequestItem[]): FilterRequestItems<I> =>
  filterRequestItems(requestItems, RequestType.delete, (items, filteredRequestItems) => {
    const idsToDelete = filteredRequestItems.map(({ request: { id } }) => id);

    return items.filter(({ id }) => !idsToDelete.includes(id));
  });

const getRequestItems = (page: Page, action: Action): RequestItem[] =>
  (action.res.list as ResponseItem[])
    .map(({ res, ...request }, index): RequestItem => ({ request, index, res }))
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

  const columns = getColumns<Create<I>>(page);

  const handlers: ReducerMap<ListState<I, ES>> = {
    [LOGGED_OUT]: (): ListState<I, ES> => initialState,
    [LIST_ITEM_CREATED]: onCreate<I, ES>(page, columns),
    [DATA_READ]: onRead<I, R, ES>(page),
    [LIST_ITEM_UPDATED]: onUpdate<I, ES>(page, columns),
    [LIST_ITEM_DELETED]: onDelete<I, ES>(page),
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
    columns: (keyof Create<I>)[],
  ) => PartialReducer<ListState<I, ES>>,
  getNewTotal: (previousTotal: number, previousItemCost: number, nextItemCost: number) => number,
) => <I extends ListCalcItem, ES extends object = {}>(
  page: Page,
  columns: (keyof Create<I>)[],
): ((state: DailyState<I, ES>, action: Action) => Partial<DailyState<I, ES>>) => {
  const listHandler = makeListHandler<I, ES>(page, columns);
  return filterByPage<I, ES, DailyState<I, ES>>(
    page,
    (state, action) =>
      ({
        ...listHandler(state, action),
        total: getNewTotal(
          state.total,
          Number(state.items.find(({ id }) => id === action?.id)?.cost ?? 0),
          Number(action?.item?.cost ?? 0),
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
): ((state: DailyState<I, ES>, action: Action) => Partial<DailyState<I, ES>>) => (
  state: DailyState<I, ES>,
  action: Action,
): Partial<DailyState<I, ES>> => {
  const requestItems = getRequestItems(page, action);

  const total = requestItems.reduce(
    (last, { res: { total: next = last } = {} }) => next,
    state.total,
  );

  return { ...state, total };
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

  const columns = getColumns<Create<I>>(page);

  const handlers = {
    [LIST_ITEM_CREATED]: onCreateDaily<I, ES>(page, columns),
    [DATA_READ]: onReadDaily<I, R, ES>(page),
    [LIST_ITEM_UPDATED]: onUpdateDaily<I, ES>(page, columns),
    [LIST_ITEM_DELETED]: onDeleteDaily<I, ES>(page, columns),
    [SYNC_RECEIVED]: onSyncReceivedDaily<I, ES>(page),
    ...extraHandlers,
  };

  return makeListReducer<I, R, DailyState<I, ES>>(page, handlers, initialState);
}
