import {
  readPlanningAccounts,
  readPlanningParameters,
  syncPlanning,
} from '~api/controllers/planning';
import { genericAuthDbResolver, genericMutationResolver } from '~api/modules/crud';
import type { Resolvers } from '~api/types';

export const planningResolvers: Resolvers = {
  Query: {
    readPlanningParameters: genericAuthDbResolver(readPlanningParameters),
    readPlanningAccounts: genericAuthDbResolver(readPlanningAccounts),
  },

  Mutation: {
    syncPlanning: genericMutationResolver(syncPlanning),
  },
};
