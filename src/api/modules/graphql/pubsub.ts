import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import config from '~api/config';
import { redisClient } from '~api/modules/redis';

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

export const redisClientSubscriber = new Redis(config.redis);

export const pubsub = new RedisPubSub({
  publisher: redisClient,
  subscriber: redisClientSubscriber,
  reviver: dateReviver,
});

export enum PubSubTopic {
  CashAllocationTargetUpdated = 'CashAllocationTargetUpdated',
  ConfigUpdated = 'ConfigUpdated',
  FundAllocationTargetsUpdated = 'FundAllocationTargetsUpdated',
  FundsChanged = 'FundsChanged',
  FundPricesUpdated = 'FundPricesUpdated',
  IncomeChanged = 'IncomeChanged',
  ListChanged = 'ListChanged',
  NetWorthCategoryCreated = 'NetWorthCategoryCreated',
  NetWorthCategoryUpdated = 'NetWorthCategoryUpdated',
  NetWorthCategoryDeleted = 'NetWorthCategoryDeleted',
  NetWorthSubcategoryCreated = 'NetWorthSubcategoryCreated',
  NetWorthSubcategoryUpdated = 'NetWorthSubcategoryUpdated',
  NetWorthSubcategoryDeleted = 'NetWorthSubcategoryDeleted',
  NetWorthEntryCreated = 'NetWorthEntryCreated',
  NetWorthEntryUpdated = 'NetWorthEntryUpdated',
  NetWorthEntryDeleted = 'NetWorthEntryDeleted',
  NetWorthCashTotalUpdated = 'NetWorthCashTotalUpdated',
  OverviewCostUpdated = 'OverviewCostUpdated',
  ReceiptCreated = 'ReceiptCreated',
}
