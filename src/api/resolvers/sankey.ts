import { getSankeyDiagram } from '~api/controllers/sankey';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const sankeyResolvers: Resolvers = {
  Query: {
    sankey: genericAuthDbResolver(getSankeyDiagram),
  },
};
