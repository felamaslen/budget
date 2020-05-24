import memoize from 'fast-memoize';
import shortid from 'shortid';

import { PageList } from '~client/types/app';
import { Create, CreateEdit, DeltaEdit } from '~client/types/crud';
import { Item } from '~client/types/list';

export enum ListActionType {
  created = '@@list/ITEM_CREATED',
  updated = '@@list/ITEM_UPDATED',
  deleted = '@@list/ITEM_DELETED',
}

export type ListItemCreated<I extends Item, P extends string> = {
  type: ListActionType.created;
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
    type: ListActionType.created,
    page,
    delta,
    fakeId: shortid.generate(),
  }),
);

export type ListItemUpdated<I extends Item, P extends string> = {
  type: ListActionType.updated;
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
    type: ListActionType.updated,
    id,
    delta,
    item,
  }),
);

export type ListItemDeleted<I extends Item, P extends string> = {
  type: ListActionType.deleted;
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
    type: ListActionType.deleted,
    id,
    item,
  }),
);
