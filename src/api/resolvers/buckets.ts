import { listBuckets, setInvestmentBucket, upsertBucket } from '~api/controllers/buckets';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const bucketsResolvers: Resolvers = {
  Query: {
    listBuckets: genericAuthDbResolver(listBuckets),
  },

  Mutation: {
    setInvestmentBucket: genericAuthDbResolver(setInvestmentBucket),
    upsertBucket: genericAuthDbResolver(upsertBucket),
  },
};
