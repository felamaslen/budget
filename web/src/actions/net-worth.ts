import shortid from 'shortid';

import {
  ActionCreated,
  ActionUpdated,
  ActionDeleted,
  Create,
  Category,
  Subcategory,
  Entry,
} from '~client/types';

export enum ActionTypeNetWorth {
  CategoryCreated = '@@net-worth/CATEGORY_CREATED',
  CategoryUpdated = '@@net-worth/CATEGORY_UPDATED',
  CategoryDeleted = '@@net-worth/CATEGORY_DELETED',
  SubcategoryCreated = '@@net-worth/SUBCATEGORY_CREATED',
  SubcategoryUpdated = '@@net-worth/SUBCATEGORY_UPDATED',
  SubcategoryDeleted = '@@net-worth/SUBCATEGORY_DELETED',
  EntryCreated = '@@net-worth/CREATED',
  EntryUpdated = '@@net-worth/UPDATED',
  EntryDeleted = '@@net-worth/DELETED',
}

type CategoryCreated = ActionCreated<ActionTypeNetWorth.CategoryCreated, Category>;

export const netWorthCategoryCreated = (item: Create<Category>): CategoryCreated => ({
  type: ActionTypeNetWorth.CategoryCreated,
  fakeId: shortid.generate(),
  item,
});

type CategoryUpdated = ActionUpdated<ActionTypeNetWorth.CategoryUpdated, Category>;

export const netWorthCategoryUpdated = (id: string, item: Create<Category>): CategoryUpdated => ({
  type: ActionTypeNetWorth.CategoryUpdated,
  id,
  item,
});

type CategoryDeleted = ActionDeleted<ActionTypeNetWorth.CategoryDeleted>;

export const netWorthCategoryDeleted = (id: string): CategoryDeleted => ({
  type: ActionTypeNetWorth.CategoryDeleted,
  id,
});

type SubcategoryCreated = ActionCreated<ActionTypeNetWorth.SubcategoryCreated, Subcategory>;

export const netWorthSubcategoryCreated = (item: Create<Subcategory>): SubcategoryCreated => ({
  type: ActionTypeNetWorth.SubcategoryCreated,
  fakeId: shortid.generate(),
  item,
});

type SubcategoryUpdated = ActionUpdated<ActionTypeNetWorth.SubcategoryUpdated, Subcategory>;

export const netWorthSubcategoryUpdated = (
  id: string,
  item: Create<Subcategory>,
): SubcategoryUpdated => ({
  type: ActionTypeNetWorth.SubcategoryUpdated,
  id,
  item,
});

type SubcategoryDeleted = ActionDeleted<ActionTypeNetWorth.SubcategoryDeleted>;

export const netWorthSubcategoryDeleted = (id: string): SubcategoryDeleted => ({
  type: ActionTypeNetWorth.SubcategoryDeleted,
  id,
});

type EntryCreated = ActionCreated<ActionTypeNetWorth.EntryCreated, Entry>;

export const netWorthCreated = (item: Create<Entry>): EntryCreated => ({
  type: ActionTypeNetWorth.EntryCreated,
  fakeId: shortid.generate(),
  item,
});

type EntryUpdated = ActionUpdated<ActionTypeNetWorth.EntryUpdated, Entry>;

export const netWorthUpdated = (id: string, item: Create<Entry>): EntryUpdated => ({
  type: ActionTypeNetWorth.EntryUpdated,
  id,
  item,
});

type EntryDeleted = ActionDeleted<ActionTypeNetWorth.EntryDeleted>;

export const netWorthDeleted = (id: string): EntryDeleted => ({
  type: ActionTypeNetWorth.EntryDeleted,
  id,
});

export type ActionNetWorth =
  | CategoryCreated
  | CategoryUpdated
  | CategoryDeleted
  | SubcategoryCreated
  | SubcategoryUpdated
  | SubcategoryDeleted
  | EntryCreated
  | EntryUpdated
  | EntryDeleted;
