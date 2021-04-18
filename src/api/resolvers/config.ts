import { getAppConfig, setAppConfig } from '~api/controllers';
import {
  createSubscription,
  genericAuthDbResolver,
  genericMutationResolver,
} from '~api/modules/crud';
import { PubSubTopic } from '~api/modules/graphql/pubsub';
import { Resolvers } from '~api/types';

export const configResolvers: Resolvers = {
  Query: {
    config: genericAuthDbResolver(getAppConfig),
  },

  Mutation: {
    setConfig: genericMutationResolver(setAppConfig),
  },

  Subscription: {
    configUpdated: createSubscription<'AppConfig'>(PubSubTopic.ConfigUpdated),
  },
};
