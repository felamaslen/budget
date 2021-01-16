import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import config from '~api/config';

const dateReviver = <T>(_: string, value: T): T | Date => {
  const isISO8601Z = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
  if (typeof value === 'string' && isISO8601Z.test(value)) {
    const tempDateNumber = Date.parse(value);
    if (!Number.isNaN(tempDateNumber)) {
      return new Date(tempDateNumber);
    }
  }
  return value;
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(config.redis),
  subscriber: new Redis(config.redis),
  reviver: dateReviver,
});

export enum PubSubTopic {
  CashAllocationTargetUpdated = 'CashAllocationTargetUpdated',
  ConfigUpdated = 'ConfigUpdated',
  FundAllocationTargetsUpdated = 'FundAllocationTargetsUpdated',
  FundCreated = 'FundCreated',
  FundUpdated = 'FundUpdated',
  FundDeleted = 'FundDeleted',
  FundPricesUpdated = 'FundPricesUpdated',
  ListItemCreated = 'ListItemCreated',
  ListItemUpdated = 'ListItemUpdated',
  ListItemDeleted = 'ListItemDeleted',
  NetWorthCategoryCreated = 'NetWorthCategoryCreated',
  NetWorthCategoryUpdated = 'NetWorthCategoryUpdated',
  NetWorthCategoryDeleted = 'NetWorthCategoryDeleted',
  NetWorthSubcategoryCreated = 'NetWorthSubcategoryCreated',
  NetWorthSubcategoryUpdated = 'NetWorthSubcategoryUpdated',
  NetWorthSubcategoryDeleted = 'NetWorthSubcategoryDeleted',
  NetWorthEntryCreated = 'NetWorthEntryCreated',
  NetWorthEntryUpdated = 'NetWorthEntryUpdated',
  NetWorthEntryDeleted = 'NetWorthEntryDeleted',
  OverviewCostUpdated = 'OverviewCostUpdated',
  ReceiptCreated = 'ReceiptCreated',
}
