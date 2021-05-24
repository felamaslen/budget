import type { Bucket, InvestmentBucket } from '~client/types/gql';

export type SkipDate = (direction: -1 | 1) => void;

export type BucketState = {
  buckets: Bucket[];
  investmentBucket: InvestmentBucket;
};

export type ViewOption = {
  numMonthsInView: number;
  monthOffset?: number;
  renderTitle?: (startDate: Date, endDate: Date) => string;
};

export type ViewOptionKey = 'month' | 'twoMonth' | 'quarter' | 'year' | 'financialYear';
