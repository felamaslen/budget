import numericHash from 'string-hash';

import {
  NetWorthCategoryCreatedSubscription,
  NetWorthCategoryDeletedSubscription,
  NetWorthCategoryType,
  NetWorthCategoryUpdatedSubscription,
  NetWorthEntryCreatedSubscription,
  NetWorthEntryDeletedSubscription,
  NetWorthEntryUpdatedSubscription,
  NetWorthSubcategoryCreatedSubscription,
  NetWorthSubcategoryDeletedSubscription,
  NetWorthSubcategoryUpdatedSubscription,
} from '~client/types/gql';

export const mockNetWorthCategoryCreated: NetWorthCategoryCreatedSubscription = {
  __typename: 'Subscription',
  netWorthCategoryCreated: {
    __typename: 'NetWorthCategoryCreated',
    item: {
      __typename: 'NetWorthCategory',
      id: numericHash('cash-category'),
      category: 'Cash',
      type: NetWorthCategoryType.Asset,
      isOption: false,
      color: 'darkgreen',
    },
  },
};

export const mockNetWorthCategoryUpdated: NetWorthCategoryUpdatedSubscription = {
  __typename: 'Subscription',
  netWorthCategoryUpdated: {
    __typename: 'NetWorthCategoryUpdated',
    item: {
      __typename: 'NetWorthCategory',
      id: numericHash('cash-category'),
      category: 'Cash (updated)',
      type: NetWorthCategoryType.Asset,
      isOption: false,
      color: 'turquoise',
    },
  },
};

export const mockNetWorthCategoryDeleted: NetWorthCategoryDeletedSubscription = {
  __typename: 'Subscription',
  netWorthCategoryDeleted: {
    __typename: 'NetWorthDeleted',
    id: numericHash('cash-category'),
  },
};

export const mockNetWorthSubcategoryCreated: NetWorthSubcategoryCreatedSubscription = {
  __typename: 'Subscription',
  netWorthSubcategoryCreated: {
    __typename: 'NetWorthSubcategoryCreated',
    item: {
      __typename: 'NetWorthSubcategory',
      id: numericHash('bank-subcategory'),
      categoryId: numericHash('cash-category'),
      subcategory: 'My bank',
      opacity: 0.38,
    },
  },
};

export const mockNetWorthSubcategoryUpdated: NetWorthSubcategoryUpdatedSubscription = {
  __typename: 'Subscription',
  netWorthSubcategoryUpdated: {
    __typename: 'NetWorthSubcategoryUpdated',
    item: {
      __typename: 'NetWorthSubcategory',
      id: numericHash('bank-subcategory'),
      categoryId: numericHash('cash-category'),
      subcategory: 'Other bank',
      opacity: 0.92,
    },
  },
};

export const mockNetWorthSubcategoryDeleted: NetWorthSubcategoryDeletedSubscription = {
  __typename: 'Subscription',
  netWorthSubcategoryDeleted: {
    __typename: 'NetWorthDeleted',
    id: numericHash('bank-subcategory'),
  },
};

export const mockNetWorthEntryCreated: NetWorthEntryCreatedSubscription = {
  __typename: 'Subscription',
  netWorthEntryCreated: {
    __typename: 'NetWorthEntryCreated',
    item: {
      __typename: 'NetWorthEntry',
      id: numericHash('my-entry'),
      date: '2020-04-20',
      values: [],
      creditLimit: [],
      currencies: [],
    },
  },
};

export const mockNetWorthEntryUpdated: NetWorthEntryUpdatedSubscription = {
  __typename: 'Subscription',
  netWorthEntryUpdated: {
    __typename: 'NetWorthEntryUpdated',
    item: {
      __typename: 'NetWorthEntry',
      id: numericHash('my-entry'),
      date: '2020-04-21',
      values: [],
      creditLimit: [],
      currencies: [],
    },
  },
};

export const mockNetWorthEntryDeleted: NetWorthEntryDeletedSubscription = {
  __typename: 'Subscription',
  netWorthEntryDeleted: {
    __typename: 'NetWorthDeleted',
    id: numericHash('my-entry'),
  },
};
