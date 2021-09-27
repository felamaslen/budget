import { gql } from 'urql';

export const MoreListDataStandard = gql`
  query MoreListDataStandard($page: PageListStandard!, $offset: Int!, $limit: Int!) {
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

export const MoreIncomeData = gql`
  query MoreIncomeData($offset: Int!, $limit: Int!) {
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
      total
      weekly
      olderExists
    }
  }
`;
