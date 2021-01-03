import { gql } from 'urql';

export const SearchSuggestions = gql`
  query SearchSuggestions(
    $page: SearchPage!
    $column: SearchItem!
    $searchTerm: String!
    $numResults: Int
  ) {
    search(page: $page, column: $column, searchTerm: $searchTerm, numResults: $numResults) {
      error
      searchTerm
      list
      nextCategory
      nextField
    }
  }
`;

export const ReceiptItem = gql`
  query ReceiptItem($item: String!) {
    receiptItem(item: $item)
  }
`;

export const ReceiptItems = gql`
  query ReceiptItems($items: [String!]!) {
    receiptItems(items: $items) {
      page
      item
      category
    }
  }
`;
