import { getAppConfig } from '~api/controllers';
import { withResolverAuth } from '~api/modules/auth';
import { Resolvers } from '~api/types';

export const configResolvers: Resolvers = {
  Query: {
    config: withResolverAuth(getAppConfig),
  },
};
