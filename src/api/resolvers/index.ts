import {
  DateResolver,
  DateTimeResolver,
  NonNegativeIntResolver,
  NonNegativeFloatResolver,
  PositiveIntResolver,
} from 'graphql-scalars';

import { pubsub, PubSubTopic } from '~api/modules/graphql/pubsub';
import { Heartbeat, Resolvers } from '~api/types';
import { Context } from '~api/types/resolver';

export * from './analysis';
export * from './config';
export * from './funds';
export * from './list';
export * from './net-worth';
export * from './overview';
export * from './search';
export * from './user';

export const mainResolvers: Resolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  NonNegativeInt: NonNegativeIntResolver,
  NonNegativeFloat: NonNegativeFloatResolver,
  PositiveInt: PositiveIntResolver,

  Subscription: {
    heartbeat: {
      subscribe: (): ReturnType<typeof pubsub.asyncIterator> =>
        pubsub.asyncIterator(PubSubTopic.Heartbeat),

      resolve: (timestamp: number, _: unknown, context: Context): Heartbeat => ({
        uid: context.user?.uid ?? null,
        timestamp,
      }),
    },
  },
};
