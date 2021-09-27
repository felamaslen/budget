import omit from 'lodash/omit';
import { Reducer } from 'redux';

import * as Actions from '~client/actions';
import { withNativeDate } from '~client/modules/data';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import type { Id, ListItemStandardNative, PageList, StandardInput, WithIds } from '~client/types';
import { PageListStandard, ReceiptPage } from '~client/types/enum';
import type { ListItem, ListItemInput, ListItemStandard } from '~client/types/gql';
import type { GQL, NativeDate, RawDate } from '~shared/types';

type FullReducer<S, A> = (state: S, action: A) => S;

export type ListState<
  I extends GQL<ListItem>,
  ES extends Record<string, unknown> = Record<string, unknown>
> = ES & CrudState<I>;

const filterByPage = <
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  S extends ListState<J> = ListState<J>,
  ActionParticular extends Actions.ActionList<I, P> = Actions.ActionList<I, P>,
  ActionGeneral extends Actions.ActionList<GQL<ListItemInput>, PageList> = Actions.ActionList<
    GQL<ListItemInput>,
    PageList
  >
>(
  thisPage: PageList,
  handler: (state: S, action: ActionParticular) => S,
): FullReducer<S, ActionGeneral> => {
  const actionIsForPage = (action: ActionGeneral | ActionParticular): action is ActionParticular =>
    action.page === thisPage;

  return (state, action): S => (actionIsForPage(action) ? handler(state, action) : state);
};

const onCreate = <
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  ES extends Record<string, unknown>
>(
  page: PageList,
): FullReducer<ListState<J, ES>, Actions.ActionList<ListItemInput, PageList>> =>
  filterByPage<I, J, P, ListState<J> & ES, Actions.ListItemCreated<I, P>>(
    page,
    (state, action) => ({
      ...state,
      ...onCreateOptimistic<I, J>(state, action.id, action.delta, action.originalFakeId),
    }),
  );

const onUpdate = <
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  ES extends Record<string, unknown>
>(
  page: PageList,
): FullReducer<ListState<J, ES>, Actions.ListItemUpdated<ListItemInput, PageList>> =>
  filterByPage<I, J, P, ListState<J, ES>, Actions.ListItemUpdated<I, P>>(page, (state, action) => ({
    ...state,
    ...onUpdateOptimistic<I, J>(state, action.id, action.delta, action.fromServer),
  }));

const onDelete = <
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  ES extends Record<string, unknown>
>(
  page: PageList,
): FullReducer<ListState<J, ES>, Actions.ListItemDeleted<ListItemInput, PageList>> =>
  filterByPage<I, J, P, ListState<J, ES>, Actions.ListItemDeleted<I, P>>(page, (state, action) => ({
    ...state,
    ...onDeleteOptimistic<J>(state, action.id, action.fromServer),
  }));

export function makeListReducer<
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  ES extends Record<string, unknown> = Record<string, unknown>
>(page: P, extraState: ES = {} as ES): Reducer<ListState<J, ES>, Actions.Action> {
  const initialState: ListState<J, ES> = {
    ...extraState,
    items: [],
    __optimistic: [],
  };

  const handlerCreate = onCreate<I, J, P, ES>(page);

  const handlerUpdate = onUpdate<I, J, P, ES>(page);
  const handlerDelete = onDelete<I, J, P, ES>(page);

  return function listReducer(
    state: ListState<J, ES> = initialState,
    action: Actions.Action,
  ): ListState<J, ES> {
    switch (action.type) {
      case Actions.ListActionType.Created:
        return handlerCreate(state, action);
      case Actions.ListActionType.Updated:
        return handlerUpdate(state, action);
      case Actions.ListActionType.Deleted:
        return handlerDelete(state, action);

      case Actions.ActionTypeLogin.LoggedOut:
        return initialState;
      default:
        return state;
    }
  };
}

type DailyProps = {
  total: number;
  weekly: number;
  offset: number;
  olderExists: boolean | null;
};

export type DailyState<ES extends Record<string, unknown> = Record<string, unknown>> = ListState<
  ListItemStandardNative,
  ES
> &
  DailyProps;

const isUpdateDelete = <I extends ListItemInput, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemUpdated<I, PageList> | Actions.ListItemDeleted<I, PageList>,
): action is Actions.ListItemUpdated<I, PageList> | Actions.ListItemDeleted<I, PageList> =>
  Reflect.has(action, 'id');

const isCreateUpdate = <I extends StandardInput, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemCreated<I, PageList> | Actions.ListItemUpdated<I, PageList>,
): action is Actions.ListItemCreated<I, PageList> | Actions.ListItemUpdated<I, PageList> =>
  Reflect.has(action, 'delta');

const isCreate = <I extends StandardInput, A extends Actions.ActionList<I, PageList>>(
  action: A | Actions.ListItemCreated<I, PageList>,
): action is Actions.ListItemCreated<I, PageList> => Reflect.has(action, 'originalFakeId');

const isConfirmCreate = <
  I extends StandardInput,
  J extends GQL<ListItem>,
  A extends Actions.ActionList<I, PageList>
>(
  state: ListState<J>,
  action: A,
): boolean =>
  isCreate(action) &&
  action.fromServer &&
  state.items.some((item) => item.id === action.originalFakeId);

const getItemCostWithId = (state: DailyState, id: Id): number =>
  state.items.find((item) => item.id === id)?.cost ?? 0;

const getPreviousItemCost = <
  I extends NativeDate<StandardInput, 'date'>,
  A extends Actions.ActionList<I, PageListStandard>
>(
  state: DailyState,
  action: A,
): number => (isUpdateDelete(action) ? getItemCostWithId(state, action.id) : 0);

const getNextItemCost = <
  I extends StandardInput,
  A extends Actions.ActionList<I, PageListStandard>
>(
  state: DailyState,
  action: A,
): number => {
  if (!isCreateUpdate(action) || isConfirmCreate(state, action)) {
    return 0;
  }
  return action.delta.cost ?? (isCreate(action) ? 0 : getItemCostWithId(state, action.id));
};

const withTotals = <
  I extends StandardInput,
  P extends PageListStandard,
  ES extends Record<string, unknown>,
  ActionParticular extends Actions.ActionList<I, P>,
  ActionGeneral extends Actions.ActionList<ListItemInput, PageList>
>(
  page: P,
  makeListHandler: (page: P) => FullReducer<ListState<ListItemStandardNative>, ActionParticular>,
  getNewTotal: (previousTotal: number, previousItemCost: number, nextItemCost: number) => number,
): FullReducer<DailyState<ES>, ActionGeneral> => {
  const listHandler = makeListHandler(page);
  return filterByPage<
    I,
    ListItemStandardNative,
    P,
    DailyState<ES>,
    ActionParticular,
    ActionGeneral
  >(page, (state, action) => ({
    ...state,
    ...listHandler(state, action),
    total: getNewTotal(
      state.total,
      getPreviousItemCost(state, action),
      getNextItemCost(state, action),
    ),
  }));
};

const makeOnMoreReceived = <
  I extends StandardInput,
  P extends PageListStandard,
  ES extends Record<string, unknown>
>(
  page: P,
): FullReducer<
  DailyState<ES>,
  Actions.MoreListDataReceived<PageList, WithIds<RawDate<I, 'date'>>>
> =>
  filterByPage<
    I,
    ListItemStandardNative,
    P,
    DailyState<ES>,
    Actions.MoreListDataReceived<P, WithIds<RawDate<I, 'date'>>>
  >(page, (state, action) => {
    const newItems = action.res.items.map(withNativeDate('date')) ?? [];
    const existingItems = state.items.filter(
      ({ id }) => !newItems.some((newItem) => newItem.id === id),
    );

    const existingOptimistic = state.__optimistic.filter(
      (_, index) => !newItems.some((newItem) => newItem.id === state.items[index].id),
    );

    return {
      ...state,
      weekly: action.res.weekly ?? state.weekly,
      total: action.res.total ?? state.total,
      offset: state.offset + 1,
      olderExists: !!action.res.olderExists,
      items: [...existingItems, ...newItems],
      __optimistic: [...existingOptimistic, ...Array<undefined>(newItems.length).fill(undefined)],
    };
  });

const makeOnReceiptCreated = <P extends PageListStandard, ES extends Record<string, unknown>>(
  page: P,
): FullReducer<DailyState<ES>, Actions.ActionReceiptCreated> => (state, action): DailyState<ES> => {
  const receiptItemsForPage = action.items
    .filter((item) => item.page === ((page as string) as ReceiptPage))
    .map((item) => omit(item, '__typename', 'page'))
    .map(withNativeDate('date'));

  return {
    ...state,
    items: [...state.items, ...receiptItemsForPage],
    __optimistic: [
      ...state.__optimistic,
      ...Array<undefined>(receiptItemsForPage.length).fill(undefined),
    ],
  };
};

const makeOnOverviewUpdated = <
  I extends StandardInput,
  P extends PageListStandard,
  ES extends Record<string, unknown>
>(
  page: P,
): FullReducer<DailyState<ES>, Actions.ListOverviewUpdated<PageList>> =>
  filterByPage<I, ListItemStandardNative, P, DailyState<ES>, Actions.ListOverviewUpdated<P>>(
    page,
    (state, action) => ({
      ...state,
      total: action.total ?? state.total,
      weekly: action.weekly ?? state.weekly,
    }),
  );

export function makeDailyListReducer<
  P extends PageListStandard,
  ES extends Record<string, unknown> = Record<string, unknown>
>(page: P, extraState: ES = {} as ES): Reducer<DailyState<ES>, Actions.Action> {
  const initialState: DailyState<ES> = {
    ...extraState,
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: true,
  };

  const onCreateDaily = withTotals<
    NativeDate<ListItemStandard, 'date'>,
    P,
    ES,
    Actions.ListItemCreated<ListItemStandardNative, P>,
    Actions.ListItemCreated<ListItemInput, PageList>
  >(page, onCreate, (total, _, cost) => total + cost);

  const onMoreReceived = makeOnMoreReceived<StandardInput, P, ES>(page);
  const onReceiptCreated = makeOnReceiptCreated<P, ES>(page);

  const onUpdateDaily = withTotals<
    StandardInput,
    P,
    ES,
    Actions.ListItemUpdated<NativeDate<ListItemStandard, 'date'>, P>,
    Actions.ListItemUpdated<ListItemInput, PageList>
  >(page, onUpdate, (total, previousCost, nextCost) => total + nextCost - previousCost);

  const onDeleteDaily = withTotals<
    StandardInput,
    P,
    ES,
    Actions.ListItemDeleted<ListItemStandardNative, P>,
    Actions.ListItemDeleted<ListItemInput, PageList>
  >(page, onDelete, (total, previousCost) => total - previousCost);

  const onOverviewUpdated = makeOnOverviewUpdated<StandardInput, P, ES>(page);

  const baseListReducer = makeListReducer<StandardInput, ListItemStandardNative, P, DailyState<ES>>(
    page,
    initialState,
  );

  return function dailyListReducer(state = initialState, action): DailyState<ES> {
    switch (action.type) {
      case Actions.ListActionType.Created:
        return onCreateDaily(state, action);

      case Actions.ListActionType.Updated:
        return onUpdateDaily(state, action);
      case Actions.ListActionType.Deleted:
        return onDeleteDaily(state, action);

      case Actions.ListActionType.OverviewUpdated:
        return onOverviewUpdated(state, action);

      case Actions.ListActionType.MoreReceived:
        return onMoreReceived(state, action);
      case Actions.ListActionType.ReceiptCreated:
        return onReceiptCreated(state, action);

      default:
        return baseListReducer(state, action);
    }
  };
}
