import { getAppConfig, setAppConfig } from '~api/controllers';
import { withResolverAuth } from '~api/modules/auth';
import { createSubscription } from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { Resolvers } from '~api/types';

export const configResolvers: Resolvers = {
  Query: {
    config: withResolverAuth(getAppConfig),
  },

  Mutation: {
    setConfig: withResolverAuth(setAppConfig),
  },

  Subscription: {
    configUpdated: createSubscription<'AppConfig'>(PubSubTopic.ConfigUpdated),
  },
};
