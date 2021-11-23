import omit from 'lodash/omit';
import { Reducer } from 'redux';

import * as Actions from '~client/actions';
import {
  onCreateOptimistic,
  onUpdateOptimistic,
  onDeleteOptimistic,
  State as CrudState,
} from '~client/reducers/crud';
import type { Id, ListItemStandardNative, PageList, StandardInput } from '~client/types';
import { PageListStandard, ReceiptPage } from '~client/types/enum';
import type { ListItem, ListItemInput, ListItemStandard } from '~client/types/gql';
import type { GQL, NativeDate } from '~shared/types';
import { withNativeDate } from '~shared/utils';

type FullReducer<S, A> = (state: S, action: A) => S;

export type ListState<
  I extends GQL<ListItem>,
  ExtraState extends Record<string, unknown> = Record<string, unknown>,
> = ExtraState & CrudState<I>;

const filterByPage = <
  ItemInput extends GQL<ListItemInput>,
  ItemReceived extends GQL<ListItem>,
  P extends PageList,
  S extends ListState<GQL<ListItem>> = ListState<GQL<ListItem>>,
  ExtraState extends Record<string, unknown> = Record<string, unknown>,
  ActionParticular extends Actions.ActionList<
    ItemInput,
    ItemReceived,
    P,
    ExtraState
  > = Actions.ActionList<ItemInput, ItemReceived, P, ExtraState>,
  ActionGeneral extends { page: string } = Actions.ActionList<
    GQL<ListItemInput>,
    GQL<ListItem>,
    PageList,
    ExtraState
  >,
>(
  thisPage: PageList,
  handler: (state: S, action: ActionParticular) => S,
): FullReducer<S, ActionGeneral> => {
  const actionIsForPage = (action: ActionGeneral | ActionParticular): action is ActionParticular =>
    action.page === thisPage;

  return (state, action): S => (actionIsForPage(action) ? handler(state, action) : state);
};

const onCreate = <
  ItemInput extends GQL<ListItemInput>,
  ItemStored extends GQL<ListItem>,
  P extends PageList,
  ExtraState extends Record<string, unknown>,
>(
  page: PageList,
): FullReducer<
  ListState<ItemStored, ExtraState>,
  Actions.ActionList<ListItemInput, ItemStored, PageList>
> =>
  filterByPage<
    ItemInput,
    ItemStored,
    P,
    ListState<ItemStored, ExtraState>,
    ExtraState,
    Actions.ListItemCreated<ItemInput, P>,
    Actions.ActionList<ListItemInput, ItemStored, PageList>
  >(page, (state, action) => ({
    ...state,
    ...onCreateOptimistic<ItemInput, ItemStored>(
      state,
      action.id,
      action.delta,
      action.originalFakeId,
    ),
  }));

const onUpdate = <
  ItemInput extends GQL<ListItemInput>,
  ItemStored extends GQL<ListItem>,
  P extends PageList,
  ExtraState extends Record<string, unknown>,
>(
  page: PageList,
): FullReducer<
  ListState<ItemStored, ExtraState>,
  Actions.ListItemUpdated<ListItemInput, PageList>
> =>
  filterByPage<
    ItemInput,
    ItemStored,
    P,
    ListState<ItemStored, ExtraState>,
    ExtraState,
    Actions.ListItemUpdated<ItemInput, P>
  >(page, (state, action) => ({
    ...state,
    ...onUpdateOptimistic<ItemInput, ItemStored>(state, action.id, action.delta, action.fromServer),
  }));

const onDelete = <
  ItemInput extends GQL<ListItemInput>,
  ItemStored extends GQL<ListItem>,
  P extends PageList,
  ExtraState extends Record<string, unknown>,
>(
  page: PageList,
): FullReducer<
  ListState<ItemStored, ExtraState>,
  Actions.ListItemDeleted<ListItemInput, PageList>
> =>
  filterByPage<
    ItemInput,
    ItemStored,
    P,
    ListState<ItemStored, ExtraState>,
    ExtraState,
    Actions.ListItemDeleted<ItemInput, P>
  >(page, (state, action) => ({
    ...state,
    ...onDeleteOptimistic<ItemStored>(state, action.id, action.fromServer),
  }));

export function makeListReducer<
  I extends GQL<ListItemInput>,
  J extends GQL<ListItem>,
  P extends PageList,
  ES extends Record<string, unknown> = Record<string, unknown>,
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

export type DailyState<ExtraState extends Record<string, unknown> = Record<string, unknown>> =
  ListState<ListItemStandardNative, ExtraState> & DailyProps;

const isUpdateDelete = <A extends Actions.ActionList<StandardInput, ListItemStandard, PageList>>(
  action:
    | A
    | Actions.ListItemUpdated<StandardInput, PageList>
    | Actions.ListItemDeleted<StandardInput, PageList>,
): action is
  | Actions.ListItemUpdated<StandardInput, PageList>
  | Actions.ListItemDeleted<StandardInput, PageList> => Reflect.has(action, 'id');

const isCreateUpdate = <A extends Actions.ActionList<StandardInput, ListItemStandard, PageList>>(
  action:
    | A
    | Actions.ListItemCreated<StandardInput, PageList>
    | Actions.ListItemUpdated<StandardInput, PageList>,
): action is
  | Actions.ListItemCreated<StandardInput, PageList>
  | Actions.ListItemUpdated<StandardInput, PageList> => Reflect.has(action, 'delta');

const isCreate = <A extends Actions.ActionList<StandardInput, ListItemStandard, PageList>>(
  action: A | Actions.ListItemCreated<StandardInput, PageList>,
): action is Actions.ListItemCreated<StandardInput, PageList> =>
  Reflect.has(action, 'originalFakeId');

const isConfirmCreate = <
  ItemStored extends GQL<ListItem>,
  A extends Actions.ActionList<StandardInput, ListItemStandard, PageList>,
>(
  state: ListState<ItemStored>,
  action: A,
): boolean =>
  isCreate(action) &&
  action.fromServer &&
  state.items.some((item) => item.id === action.originalFakeId);

const getItemCostWithId = (state: DailyState, id: Id): number =>
  state.items.find((item) => item.id === id)?.cost ?? 0;

const getPreviousItemCost = <
  A extends Actions.ActionList<StandardInput, ListItemStandard, PageListStandard>,
>(
  state: DailyState,
  action: A,
): number => (isUpdateDelete(action) ? getItemCostWithId(state, action.id) : 0);

const getNextItemCost = <
  A extends Actions.ActionList<StandardInput, ListItemStandard, PageListStandard>,
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
  P extends PageListStandard,
  ExtraState extends Record<string, unknown>,
  ActionParticular extends Actions.ActionList<StandardInput, ListItemStandard, P, ExtraState>,
  ActionGeneral extends Actions.ActionList<ListItemInput, ListItemStandard, PageList>,
>(
  page: P,
  makeListHandler: (page: P) => FullReducer<ListState<ListItemStandardNative>, ActionParticular>,
  getNewTotal: (previousTotal: number, previousItemCost: number, nextItemCost: number) => number,
): FullReducer<DailyState<ExtraState>, ActionGeneral> => {
  const listHandler = makeListHandler(page);
  return filterByPage<
    StandardInput,
    ListItemStandard,
    P,
    DailyState<ExtraState>,
    ExtraState,
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

const makeOnStandardDataReceived = <
  P extends PageListStandard,
  ExtraState extends Record<string, unknown>,
>(
  page: P,
): FullReducer<DailyState<ExtraState>, Actions.ListDataReceived<PageList, GQL<ListItemStandard>>> =>
  filterByPage<
    StandardInput,
    GQL<ListItemStandard>,
    P,
    DailyState<ExtraState>,
    ExtraState,
    Actions.ListDataReceived<P, GQL<ListItemStandard>, ExtraState>,
    Actions.ListDataReceived<PageList, GQL<ListItemStandard>>
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
      ...action.extraState,
    };
  });

const makeOnReceiptCreated =
  <P extends PageListStandard, ES extends Record<string, unknown>>(
    page: P,
  ): FullReducer<DailyState<ES>, Actions.ActionReceiptCreated> =>
  (state, action): DailyState<ES> => {
    const receiptItemsForPage = action.items
      .filter((item) => item.page === (page as string as ReceiptPage))
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
  ItemInput extends StandardInput,
  P extends PageListStandard,
  ExtraState extends Record<string, unknown>,
>(
  page: P,
): FullReducer<DailyState<ExtraState>, Actions.ListOverviewUpdated<PageList, ExtraState>> =>
  filterByPage<
    ItemInput,
    ListItemStandardNative,
    P,
    DailyState<ExtraState>,
    ExtraState,
    Actions.ListOverviewUpdated<P, ExtraState>
  >(page, (state, action) => ({
    ...state,
    total: action.total ?? state.total,
    weekly: action.weekly ?? state.weekly,
    ...action.extraState,
  }));

export function makeDailyListReducer<
  P extends PageListStandard,
  ExtraState extends Record<string, unknown> = Record<string, unknown>,
>(
  page: P,
  extraState: ExtraState = {} as ExtraState,
): Reducer<DailyState<ExtraState>, Actions.Action> {
  const initialState: DailyState<ExtraState> = {
    ...extraState,
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: true,
  };

  const onCreateDaily = withTotals<
    P,
    ExtraState,
    Actions.ListItemCreated<ListItemStandardNative, P>,
    Actions.ListItemCreated<ListItemInput, PageList>
  >(page, onCreate, (total, _, cost) => total + cost);

  const onDataReceived = makeOnStandardDataReceived<P, ExtraState>(page);
  const onReceiptCreated = makeOnReceiptCreated<P, ExtraState>(page);

  const onUpdateDaily = withTotals<
    P,
    ExtraState,
    Actions.ListItemUpdated<NativeDate<ListItemStandard, 'date'>, P>,
    Actions.ListItemUpdated<ListItemInput, PageList>
  >(page, onUpdate, (total, previousCost, nextCost) => total + nextCost - previousCost);

  const onDeleteDaily = withTotals<
    P,
    ExtraState,
    Actions.ListItemDeleted<ListItemStandardNative, P>,
    Actions.ListItemDeleted<ListItemInput, PageList>
  >(page, onDelete, (total, previousCost) => total - previousCost);

  const onOverviewUpdated = makeOnOverviewUpdated<StandardInput, P, ExtraState>(page);

  const baseListReducer = makeListReducer<
    StandardInput,
    ListItemStandardNative,
    P,
    DailyState<ExtraState>
  >(page, initialState);

  return function dailyListReducer(state = initialState, action): DailyState<ExtraState> {
    switch (action.type) {
      case Actions.ListActionType.Created:
        return onCreateDaily(state, action);

      case Actions.ListActionType.Updated:
        return onUpdateDaily(state, action);
      case Actions.ListActionType.Deleted:
        return onDeleteDaily(state, action);

      case Actions.ListActionType.OverviewUpdated:
        return onOverviewUpdated(state, action as Actions.ListOverviewUpdated<P, ExtraState>);

      case Actions.ListActionType.DataReceived:
        return onDataReceived(state, action);
      case Actions.ListActionType.ReceiptCreated:
        return onReceiptCreated(state, action);

      default:
        return baseListReducer(state, action);
    }
  };
}
