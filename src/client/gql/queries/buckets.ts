import { gql } from 'urql';

export const ListBuckets = gql`
  query ListBuckets($startDate: String!, $endDate: String!) {
    listBuckets(startDate: $startDate, endDate: $endDate) {
      buckets {
        id
        page
        filterCategory
        expectedValue
        actualValue
      }
      error
    }
    getInvestmentBucket {
      value
    }
  }
`;
