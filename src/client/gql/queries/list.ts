import { gql } from 'urql';

export const ReadListStandard = gql`
  query ReadListStandard($page: PageListStandard!, $offset: Int!, $limit: Int!) {
    readListStandard: readList(page: $page, offset: $offset, limit: $limit) {
      items {
        id
        date
        item
        cost
        category
        shop
      }
      total
      weekly
      olderExists
    }
  }
`;

export const ReadIncome = gql`
  query ReadIncome($offset: Int!, $limit: Int!) {
    readIncome(offset: $offset, limit: $limit) {
      items {
        id
        date
        item
        cost
        category
        shop
        deductions {
          name
          value
        }
      }
      total {
        gross
        deductions {
          name
          value
        }
      }
      weekly
      olderExists
    }
  }
`;
