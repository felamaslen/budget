import { gql } from 'urql';

export const UpsertBucket = gql`
  mutation UpsertBucket($date: String!, $id: NonNegativeInt!, $bucket: BucketInput!) {
    upsertBucket(date: $date, id: $id, bucket: $bucket) {
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
