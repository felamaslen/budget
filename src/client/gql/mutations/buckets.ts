import { gql } from 'urql';

export const UpsertBucket = gql`
  mutation UpsertBucket(
    $startDate: String!
    $endDate: String!
    $id: NonNegativeInt!
    $bucket: BucketInput!
  ) {
    upsertBucket(startDate: $startDate, endDate: $endDate, id: $id, bucket: $bucket) {
      buckets {
        id
        page
        filterCategory
        expectedValue
        actualValue
      }
      error
    }
  }
`;

export const SetInvestmentBucket = gql`
  mutation SetInvestmentBucket($value: NonNegativeInt!) {
    setInvestmentBucket(value: $value) {
      expectedValue
      error
    }
  }
`;
