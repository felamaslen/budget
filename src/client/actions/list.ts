import { generateFakeId } from '~client/modules/data';
import type { Id, ListReadResponseNative, PageList, WithIds } from '~client/types';
import type {
  ListItem,
  ListItemInput,
  ListItemStandard,
  Maybe,
  ReceiptItem,
} from '~client/types/gql';
import { GQL } from '~shared/types';

export const enum ListActionType {
  Created = '@@list/ITEM_CREATED',
  Updated = '@@list/ITEM_UPDATED',
  Deleted = '@@list/ITEM_DELETED',
  ReceiptCreated = '@@list/RECEIPT_CREATED',
  OverviewUpdated = '@@list/OVERVIEW_UPDATED',
  DataReceived = '@@list/DATA_RECEIVED',
}

export type ListItemCreated<I extends ListItemInput, P extends PageList> = {
  type: ListActionType.Created;
  page: P;
  delta: I;
  fromServer: boolean;
  id: Id;
  originalFakeId?: Id;
};

export const listItemCreated = <I extends ListItemInput, P extends PageList>(
  page: P,
  delta: I,
  fromServer: boolean,
  id?: Id,
  originalFakeId?: Id,
): ListItemCreated<I, P> => ({
  type: ListActionType.Created,
  page,
  delta,
  fromServer,
  id: id ?? generateFakeId(),
  originalFakeId,
});

export type ActionReceiptCreated = {
  type: ListActionType.ReceiptCreated;
  items: ReceiptItem[];
};

export const receiptCreated = (items: ReceiptItem[]): ActionReceiptCreated => ({
  type: ListActionType.ReceiptCreated,
  items,
});

export type ListItemUpdated<I extends ListItemInput, P extends PageList> = {
  type: ListActionType.Updated;
  page: P;
  id: Id;
  delta: Partial<I>;
  item: WithIds<I> | null;
  fromServer: boolean;
};

export const listItemUpdated = <I extends ListItemInput, P extends PageList = PageList>(
  page: P,
  id: Id,
  delta: Partial<I>,
  item: WithIds<I> | null,
  fromServer: boolean,
): ListItemUpdated<I, P> => ({
  page,
  type: ListActionType.Updated,
  id,
  delta,
  item,
  fromServer,
});

export type ListItemDeleted<I extends ListItemInput, P extends PageList> = {
  type: ListActionType.Deleted;
  page: P;
  id: Id;
  item: I;
  fromServer: boolean;
};

export const listItemDeleted = <I extends ListItemInput, P extends PageList = PageList>(
  page: P,
  id: Id,
  item: I,
  fromServer: boolean,
): ListItemDeleted<I, P> => ({
  page,
  type: ListActionType.Deleted,
  id,
  item,
  fromServer,
});

export type ListOverviewUpdated<
  P extends PageList,
  ExtraState extends Record<string, unknown> = never,
> = {
  type: ListActionType.OverviewUpdated;
  page: P;
  overviewCost: number[];
  total?: Maybe<number>;
  weekly?: Maybe<number>;
  extraState?: ExtraState;
};

export const listOverviewUpdated = <
  P extends PageList,
  ExtraState extends Record<string, unknown> = never,
>(
  page: P,
  overviewCost: number[],
  total?: Maybe<number>,
  weekly?: Maybe<number>,
  extraState?: ExtraState,
): ListOverviewUpdated<P, ExtraState> => ({
  type: ListActionType.OverviewUpdated,
  page,
  overviewCost,
  total,
  weekly,
  extraState,
});

export type ListDataReceived<
  P extends PageList,
  ItemReceived extends GQL<ListItemStandard>,
  ExtraState extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: ListActionType.DataReceived;
  page: P;
  res: ListReadResponseNative<ItemReceived>;
  extraState?: ExtraState;
};

export const listDataReceived = <
  P extends PageList,
  ItemReceived extends GQL<ListItemStandard>,
  ExtraState extends Record<string, unknown> = never,
>(
  page: P,
  res: ListReadResponseNative<ItemReceived>,
  extraState?: ExtraState,
): ListDataReceived<P, ItemReceived, ExtraState> => ({
  type: ListActionType.DataReceived,
  page,
  res,
  extraState,
});

export type ActionList<
  ItemInput extends ListItemInput,
  ItemReceived extends GQL<ListItem>,
  P extends PageList,
  ExtraState extends Record<string, unknown> = Record<string, unknown>,
> =
  | ListItemCreated<ItemInput, P>
  | ListItemUpdated<ItemInput, P>
  | ListItemDeleted<ItemInput, P>
  | ListOverviewUpdated<P, ExtraState>
  | (ItemReceived extends GQL<ListItemStandard>
      ? ListDataReceived<P, ItemReceived, ExtraState>
      : never);
