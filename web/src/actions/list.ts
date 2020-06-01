import memoize from 'fast-memoize';
import shortid from 'shortid';

import { PageList, Create, CreateEdit, DeltaEdit, Item, ListItem } from '~client/types';

export const enum ListActionType {
  Created = '@@list/ITEM_CREATED',
  Updated = '@@list/ITEM_UPDATED',
  Deleted = '@@list/ITEM_DELETED',
}

export type ListItemCreated<I extends Item, P extends string> = {
  type: ListActionType.Created;
  page: P;
  delta: Create<I>;
  fakeId: string;
};

export type OnCreateList<I extends Item, P extends string, O = ListItemCreated<I, P>> = (
  delta: Create<I>,
) => O;

export const listItemCreated = memoize(
  <I extends Item, P extends string = PageList>(page: P): OnCreateList<I, P> => (
    delta,
  ): ListItemCreated<I, P> => ({
    type: ListActionType.Created,
    page,
    delta,
    fakeId: shortid.generate(),
  }),
);

export type ListItemUpdated<I extends Item, P extends string> = {
  type: ListActionType.Updated;
  page: P;
  id: string;
  delta: DeltaEdit<I>;
  item: CreateEdit<I>;
};

export type OnUpdateList<I extends Item, P extends string, O = ListItemUpdated<I, P>> = (
  id: string,
  delta: DeltaEdit<I>,
  item: CreateEdit<I>,
) => O;

export const listItemUpdated = memoize(
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
  id: string;
  item: CreateEdit<I>;
};

export type OnDeleteList<I extends Item, P extends string, O = ListItemDeleted<I, P>> = (
  id: string,
  item: CreateEdit<I>,
) => O;

export const listItemDeleted = memoize(
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

export type ActionList<I extends ListItem, P extends string> =
  | ListItemCreated<I, P>
  | ListItemUpdated<I, P>
  | ListItemDeleted<I, P>;
