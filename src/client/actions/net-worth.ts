import type { Id, NetWorthEntryRead } from '~client/types';
import type { NetWorthCategory, NetWorthSubcategory } from '~client/types/gql';

export const enum ActionTypeNetWorth {
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

type CategoryCreated = { type: ActionTypeNetWorth.CategoryCreated; item: NetWorthCategory };

export const netWorthCategoryCreated = (item: NetWorthCategory): CategoryCreated => ({
  type: ActionTypeNetWorth.CategoryCreated,
  item,
});

type CategoryUpdated = {
  type: ActionTypeNetWorth.CategoryUpdated;
  item: NetWorthCategory;
};

export const netWorthCategoryUpdated = (item: NetWorthCategory): CategoryUpdated => ({
  type: ActionTypeNetWorth.CategoryUpdated,
  item,
});

type CategoryDeleted = { type: ActionTypeNetWorth.CategoryDeleted; id: Id };

export const netWorthCategoryDeleted = (id: Id): CategoryDeleted => ({
  type: ActionTypeNetWorth.CategoryDeleted,
  id,
});

type SubcategoryCreated = {
  type: ActionTypeNetWorth.SubcategoryCreated;
  item: NetWorthSubcategory;
};

export const netWorthSubcategoryCreated = (item: NetWorthSubcategory): SubcategoryCreated => ({
  type: ActionTypeNetWorth.SubcategoryCreated,
  item,
});

type SubcategoryUpdated = {
  type: ActionTypeNetWorth.SubcategoryUpdated;
  item: NetWorthSubcategory;
};

export const netWorthSubcategoryUpdated = (item: NetWorthSubcategory): SubcategoryUpdated => ({
  type: ActionTypeNetWorth.SubcategoryUpdated,
  item,
});

type SubcategoryDeleted = { type: ActionTypeNetWorth.SubcategoryDeleted; id: Id };

export const netWorthSubcategoryDeleted = (id: Id): SubcategoryDeleted => ({
  type: ActionTypeNetWorth.SubcategoryDeleted,
  id,
});

type EntryCreated = { type: ActionTypeNetWorth.EntryCreated; item: NetWorthEntryRead };

export const netWorthEntryCreated = (item: NetWorthEntryRead): EntryCreated => ({
  type: ActionTypeNetWorth.EntryCreated,
  item,
});

type EntryUpdated = {
  type: ActionTypeNetWorth.EntryUpdated;
  item: NetWorthEntryRead;
};

export const netWorthEntryUpdated = (item: NetWorthEntryRead): EntryUpdated => ({
  type: ActionTypeNetWorth.EntryUpdated,
  item,
});

type EntryDeleted = { type: ActionTypeNetWorth.EntryDeleted; id: Id };

export const netWorthEntryDeleted = (id: Id): EntryDeleted => ({
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
