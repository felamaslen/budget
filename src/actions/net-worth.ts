import shortid from 'shortid';

import { ExcludeOne } from '~/types/utils';
import { SocketAction } from '~/types/actions';
import { Category, Subcategory, Entry } from '~/types/net-worth';

import {
  NET_WORTH_READ,
  NET_WORTH_CATEGORY_CREATED,
  NET_WORTH_CATEGORY_UPDATED,
  NET_WORTH_CATEGORY_DELETED,
  NET_WORTH_SUBCATEGORY_CREATED,
  NET_WORTH_SUBCATEGORY_UPDATED,
  NET_WORTH_SUBCATEGORY_DELETED,
  NET_WORTH_ENTRY_CREATED,
  NET_WORTH_ENTRY_UPDATED,
  NET_WORTH_ENTRY_DELETED,
} from '~/constants/actions.rt';

export const netWorthRead = (): SocketAction => ({
  type: NET_WORTH_READ,
  __FROM_SOCKET__: false,
});

export const netWorthCategoryCreated = (
  item: ExcludeOne<Category, 'id'>,
): SocketAction<ExcludeOne<Category, 'id'> & { fakeId: string }> => ({
  type: NET_WORTH_CATEGORY_CREATED,
  __FROM_SOCKET__: false,
  payload: { ...item, fakeId: shortid.generate() },
});

export const netWorthSubcategoryCreated = (
  item: ExcludeOne<Subcategory, 'id'>,
): SocketAction<ExcludeOne<Subcategory, 'id'> & { fakeId: string }> => ({
  type: NET_WORTH_SUBCATEGORY_CREATED,
  __FROM_SOCKET__: false,
  payload: { ...item, fakeId: shortid.generate() },
});

export const netWorthEntryCreated = (
  item: ExcludeOne<Entry, 'id'>,
): SocketAction<ExcludeOne<Entry<string>, 'id'> & { fakeId: string }> => ({
  type: NET_WORTH_ENTRY_CREATED,
  __FROM_SOCKET__: false,
  payload: { ...item, fakeId: shortid.generate(), date: item.date.toISOString() },
});

export const netWorthCategoryUpdated = (
  id: string,
  item: ExcludeOne<Category, 'id'>,
): SocketAction<Category> => ({
  type: NET_WORTH_CATEGORY_UPDATED,
  __FROM_SOCKET__: false,
  payload: { id, ...item },
});

export const netWorthSubcategoryUpdated = (
  id: string,
  item: ExcludeOne<Subcategory, 'id'>,
): SocketAction<Subcategory> => ({
  type: NET_WORTH_SUBCATEGORY_UPDATED,
  __FROM_SOCKET__: false,
  payload: { id, ...item },
});

export const netWorthEntryUpdated = (
  id: string,
  item: ExcludeOne<Entry, 'id'>,
): SocketAction<Entry<string>> => ({
  type: NET_WORTH_ENTRY_UPDATED,
  __FROM_SOCKET__: false,
  payload: { id, ...item, date: item.date.toISOString() },
});

export const netWorthCategoryDeleted = (id: string): SocketAction => ({
  type: NET_WORTH_CATEGORY_DELETED,
  __FROM_SOCKET__: false,
  payload: { id },
});

export const netWorthSubcategoryDeleted = (id: string): SocketAction => ({
  type: NET_WORTH_SUBCATEGORY_DELETED,
  __FROM_SOCKET__: false,
  payload: id,
});

export const netWorthEntryDeleted = (id: string): SocketAction => ({
  type: NET_WORTH_ENTRY_DELETED,
  __FROM_SOCKET__: false,
  payload: id,
});
