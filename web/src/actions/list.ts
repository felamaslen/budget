import { generateFakeId } from '~client/modules/data';
import {
  GQL,
  Id,
  ListItemExtended,
  ListItemInput,
  ListReadResponse,
  ListReadResponseExtended,
  ListItemStandard,
  Maybe,
  PageList,
  WithIds,
  ReceiptItem,
} from '~client/types';

export const enum ListActionType {
  Created = '@@list/ITEM_CREATED',
  Updated = '@@list/ITEM_UPDATED',
  Deleted = '@@list/ITEM_DELETED',
  ReceiptCreated = '@@list/RECEIPT_CREATED',
  OverviewUpdated = '@@list/OVERVIEW_UPDATED',
  MoreReceived = '@@list/MORE_RECEIVED',
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

export type ListOverviewUpdated<P extends PageList> = {
  type: ListActionType.OverviewUpdated;
  page: P;
  overviewCost: number[];
  total?: Maybe<number>;
  weekly?: Maybe<number>;
};

export const listOverviewUpdated = <P extends PageList>(
  page: P,
  overviewCost: number[],
  total?: Maybe<number>,
  weekly?: Maybe<number>,
): ListOverviewUpdated<P> => ({
  type: ListActionType.OverviewUpdated,
  page,
  overviewCost,
  total,
  weekly,
});

export type MoreListDataReceived<P extends string> = {
  type: ListActionType.MoreReceived;
  page: P;
  res: Omit<GQL<ListReadResponse>, 'items'> & {
    items: (ListItemStandard | ListItemExtended)[];
  };
};

export const moreListDataReceived = <P extends PageList>(
  page: P,
  res: P extends PageList ? ListReadResponse | ListReadResponseExtended : never,
): MoreListDataReceived<P> => ({
  type: ListActionType.MoreReceived,
  page,
  res,
});

export type ActionList<I extends ListItemInput, P extends PageList> =
  | ListItemCreated<I, P>
  | ListItemUpdated<I, P>
  | ListItemDeleted<I, P>
  | ListOverviewUpdated<P>
  | MoreListDataReceived<P>;
