import numericHash from 'string-hash';

import {
  NetWorthCategoryCreatedSubscription,
  NetWorthCategoryDeletedSubscription,
  NetWorthCategoryType,
  NetWorthCategoryUpdatedSubscription,
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
