import gql from 'graphql-tag';

export const searchSchema = gql`
  enum SearchPage {
    income
    bills
    food
    general
    holiday
    social
  }

  enum SearchItem {
    item
    category
    shop
  }

  type SearchResult {
    error: String
    searchTerm: String
    list: [String!]!
    nextCategory: [String!]
    nextField: String
  }

  enum ReceiptPage {
    food
    general
    social
  }

  type ReceiptCategory {
    item: String!
    page: ReceiptPage!
    category: String!
  }

  extend type Query {
    search(
      page: SearchPage!
      column: SearchItem!
      searchTerm: String!
      numResults: Int
    ): SearchResult

    receiptItem(item: String!): String
    receiptItems(items: [String!]!): [ReceiptCategory!]
  }
`;
