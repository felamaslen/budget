import { syncPlanning } from '~api/controllers/planning';
import { genericMutationResolver } from '~api/modules/crud';
import type { Resolvers } from '~api/types';

export const planningResolvers: Resolvers = {
  Mutation: {
    syncPlanning: genericMutationResolver(syncPlanning),
  },
};
