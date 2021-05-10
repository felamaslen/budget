import type { Bucket, InvestmentBucket } from '~client/types/gql';

export type SkipDate = (direction: -1 | 1) => void;

export type BucketState = {
  buckets: Bucket[];
  investmentBucket: InvestmentBucket;
};
