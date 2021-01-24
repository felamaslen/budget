import { getOldOverviewData, getOverviewData, getOverviewPreview } from '~api/controllers';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const overviewResolvers: Resolvers = {
  Query: {
    overview: genericAuthDbResolver(getOverviewData),
    overviewOld: genericAuthDbResolver(getOldOverviewData),

    overviewPreview: genericAuthDbResolver(getOverviewPreview),
  },
};
