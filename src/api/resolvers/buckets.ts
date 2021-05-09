import { listBuckets, upsertBucket } from '~api/controllers/buckets';
import { genericAuthDbResolver } from '~api/modules/crud';
import { Resolvers } from '~api/types';

export const bucketsResolvers: Resolvers = {
  Query: {
    listBuckets: genericAuthDbResolver(listBuckets),
  },

  Mutation: {
    upsertBucket: genericAuthDbResolver(upsertBucket),
  },
};
