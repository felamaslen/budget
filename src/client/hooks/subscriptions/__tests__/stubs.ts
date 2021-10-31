import numericHash from 'string-hash';

import {
  NetWorthCategoryCreatedSubscription,
  NetWorthCategoryDeletedSubscription,
  NetWorthCategoryType,
  NetWorthCategoryUpdatedSubscription,
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
