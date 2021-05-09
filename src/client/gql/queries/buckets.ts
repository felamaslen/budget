import { gql } from 'urql';

export const ListBuckets = gql`
  query ListBuckets($date: String!) {
    listBuckets(date: $date) {
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
