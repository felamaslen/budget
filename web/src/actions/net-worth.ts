import shortid from 'shortid';
import { Action } from 'create-reducer-object';

import * as actions from '~client/constants/actions/net-worth';
import { Create } from '~client/types/crud';
import { Category, Subcategory, EntryWithOptionalIds } from '~client/types/net-worth';

export const netWorthCategoryCreated = (item: Create<Category>): Action => ({
  type: actions.NET_WORTH_CATEGORY_CREATED,
  fakeId: shortid.generate(),
  item,
});
export const netWorthCategoryUpdated = (id: string, item: Create<Category>): Action => ({
  type: actions.NET_WORTH_CATEGORY_UPDATED,
  id,
  item,
});
export const netWorthCategoryDeleted = (id: string): Action => ({
  type: actions.NET_WORTH_CATEGORY_DELETED,
  id,
});

export const netWorthSubcategoryCreated = (item: Create<Subcategory>): Action => ({
  type: actions.NET_WORTH_SUBCATEGORY_CREATED,
  fakeId: shortid.generate(),
  item,
});
export const netWorthSubcategoryUpdated = (id: string, item: Create<Subcategory>): Action => ({
  type: actions.NET_WORTH_SUBCATEGORY_UPDATED,
  id,
  item,
});
export const netWorthSubcategoryDeleted = (id: string): Action => ({
  type: actions.NET_WORTH_SUBCATEGORY_DELETED,
  id,
});

export const netWorthCreated = (item: Create<EntryWithOptionalIds>): Action => ({
  type: actions.NET_WORTH_CREATED,
  fakeId: shortid.generate(),
  item,
});
export const netWorthUpdated = (id: string, item: Create<EntryWithOptionalIds>): Action => ({
  type: actions.NET_WORTH_UPDATED,
  id,
  item,
});
export const netWorthDeleted = (id: string): Action => ({ type: actions.NET_WORTH_DELETED, id });
