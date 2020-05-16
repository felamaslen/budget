import shortid from 'shortid';
import { Action } from 'create-reducer-object';

import * as actions from '~client/constants/actions/list';
import { Page } from '~client/types/app';
import { Create } from '~client/types/crud';
import { Item } from '~client/types/list';

export const listItemCreated = <I extends Item>(page: Page, item: Omit<I, 'id'>): Action => ({
  type: actions.LIST_ITEM_CREATED,
  page,
  item,
  fakeId: shortid.generate(),
});

export const listItemUpdated = <I extends Item>(
  page: Page,
  id: string,
  item: Create<I>,
  oldItem: Create<I>,
): Action => ({
  page,
  type: actions.LIST_ITEM_UPDATED,
  id,
  item,
  oldItem,
});

export const listItemDeleted = <I extends Item>(
  id: string,
  { page }: { page: Page },
  oldItem: Create<I>,
): Action => ({
  page,
  type: actions.LIST_ITEM_DELETED,
  id,
  oldItem,
});
