import { getAnalysisData, getDeepAnalysisData } from '~api/controllers';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const analysisResolvers: Resolvers = {
  Query: {
    analysis: genericAuthDbResolver(getAnalysisData),
    analysisDeep: genericAuthDbResolver(getDeepAnalysisData),
  },
};
