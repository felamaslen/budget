import { gql } from 'urql';

export const MoreListDataStandard = gql`
  query MoreListDataStandard($page: PageListStandard!, $offset: Int!, $limit: Int!) {
    readListStandard: readList(page: $page, offset: $offset, limit: $limit) {
      items {
        id
        date
        item
        cost
      }
      olderExists
    }
  }
`;

export const MoreListDataExtended = gql`
  query MoreListDataExtended($page: PageListExtended!, $offset: Int!, $limit: Int!) {
    readListExtended(page: $page, offset: $offset, limit: $limit) {
      items {
        id
        date
        item
        cost
        category
        shop
      }
      olderExists
    }
  }
`;
