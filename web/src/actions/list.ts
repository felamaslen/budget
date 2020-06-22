import moize from 'moize';

import { generateFakeId } from '~client/modules/data';
import {
  Id,
  PageList,
  PageListCalc,
  Create,
  CreateEdit,
  DeltaEdit,
  Item,
  ListItem,
  ReadResponse,
} from '~client/types';

export const enum ListActionType {
  Created = '@@list/ITEM_CREATED',
  Updated = '@@list/ITEM_UPDATED',
  Deleted = '@@list/ITEM_DELETED',
  MoreRequestInitiated = '@@list/MORE_REQUEST_INITIATED',
  MoreRequested = '@@list/MORE_REQUESTED',
  MoreReceived = '@@list/MORE_RECEIVED',
}

export type ListItemCreated<I extends Item, P extends string> = {
  type: ListActionType.Created;
  page: P;
  delta: Create<I>;
  fakeId: number;
};

export type OnCreateList<I extends Item, P extends string, O = ListItemCreated<I, P>> = (
  delta: Create<I>,
) => O;

export const listItemCreated = moize(
  <I extends Item, P extends string = PageList>(page: P): OnCreateList<I, P> => (
    delta,
  ): ListItemCreated<I, P> => ({
    type: ListActionType.Created,
    page,
    delta,
    fakeId: generateFakeId(),
  }),
);

export type ListItemUpdated<I extends Item, P extends string> = {
  type: ListActionType.Updated;
  page: P;
  id: Id;
  delta: DeltaEdit<I>;
  item: CreateEdit<I>;
};

export type OnUpdateList<I extends Item, P extends string, O = ListItemUpdated<I, P>> = (
  id: Id,
  delta: DeltaEdit<I>,
  item: CreateEdit<I>,
) => O;

export const listItemUpdated = moize(
  <I extends Item, P extends string = PageList>(page: P): OnUpdateList<I, P> => (
    id,
    delta,
    item,
  ): ListItemUpdated<I, P> => ({
    page,
    type: ListActionType.Updated,
    id,
    delta,
    item,
  }),
);

export type ListItemDeleted<I extends Item, P extends string> = {
  type: ListActionType.Deleted;
  page: P;
  id: Id;
  item: CreateEdit<I>;
};

export type OnDeleteList<I extends Item, P extends string, O = ListItemDeleted<I, P>> = (
  id: Id,
  item: CreateEdit<I>,
) => O;

export const listItemDeleted = moize(
  <I extends Item, P extends string = PageList>(page: P): OnDeleteList<I, P> => (
    id,
    item,
  ): ListItemDeleted<I, P> => ({
    page,
    type: ListActionType.Deleted,
    id,
    item,
  }),
);

export type MoreListDataRequestInitiated<P extends string> = {
  type: ListActionType.MoreRequestInitiated;
  page: P;
};

export const moreListDataRequestInitiated = <P extends string>(
  page: P,
): MoreListDataRequestInitiated<P> => ({
  type: ListActionType.MoreRequestInitiated,
  page,
});

export type MoreListDataRequested<P extends string> = {
  type: ListActionType.MoreRequested;
  page: P;
};

export const moreListDataRequested = <P extends string>(page: P): MoreListDataRequested<P> => ({
  type: ListActionType.MoreRequested,
  page,
});

export type MoreListDataReceived<P extends string> = {
  type: ListActionType.MoreReceived;
  page: P;
  res: P extends PageListCalc ? ReadResponse[P] : never;
};

export const moreListDataReceived = <P extends string>(
  page: P,
  res: P extends PageListCalc ? ReadResponse[P] : never,
): MoreListDataReceived<P> => ({
  type: ListActionType.MoreReceived,
  page,
  res,
});

export type ActionList<I extends ListItem, P extends string> =
  | ListItemCreated<I, P>
  | ListItemUpdated<I, P>
  | ListItemDeleted<I, P>
  | MoreListDataRequestInitiated<P>
  | MoreListDataRequested<P>
  | MoreListDataReceived<P>;
