import gql from 'graphql-tag';

const query = gql`
  enum PageListStandard {
    income
    bills
    food
    general
    holiday
    social
  }

  enum PageListExtended {
    food
    general
    holiday
    social
  }

  type ListItem {
    id: Int!
    item: String!
  }
  type ListItemStandard {
    id: Int!
    date: Date!
    item: String!
    cost: Int!
  }
  type ListItemExtended {
    id: Int!
    date: Date!
    item: String!
    category: String!
    cost: Int!
    shop: String!
  }
  type ListItemStandardOrExtended {
    date: Date!
    item: String!
    category: String
    cost: Int!
    shop: String
  }
  type ListReadResponse {
    error: String
    items: [ListItemStandard!]!
    olderExists: Boolean
    weekly: Int
    total: Int
  }
  type ListReadResponseExtended {
    error: String
    items: [ListItemExtended!]!
    olderExists: Boolean
    weekly: Int
    total: Int
  }

  type ListTotalsResponse {
    error: String
    total: Int
    weekly: Int
  }
  extend type Query {
    readList(page: PageListStandard!, offset: Int, limit: Int): ListReadResponse
    readListExtended(page: PageListExtended!, offset: Int, limit: Int): ListReadResponseExtended
    readListTotals(page: PageListStandard!): ListTotalsResponse
  }
`;

const mutation = gql`
  input ListItemInput {
    fakeId: Int
    item: String!
  }

  input ListItemStandardInput {
    date: String!
    item: String!
    cost: Int!
    category: String
    shop: String
  }

  input ReceiptInput {
    page: ReceiptPage!
    item: String!
    category: String!
    cost: Int!
  }

  type ReceiptCreated {
    error: String
    items: [ReceiptItem!]
  }

  extend type Mutation {
    createListItem(
      page: PageListStandard!
      fakeId: Int!
      input: ListItemStandardInput!
    ): CrudResponseCreate
    updateListItem(
      page: PageListStandard!
      id: Int!
      input: ListItemStandardInput!
    ): CrudResponseUpdate
    deleteListItem(page: PageListStandard!, id: Int!): CrudResponseDelete

    createReceipt(date: Date!, shop: String!, items: [ReceiptInput!]!): ReceiptCreated
  }
`;

const subscription = gql`
  type ListItemCreateUpdate {
    page: PageListStandard!
    id: Int!
    fakeId: Int
    item: ListItemStandardOrExtended!
    overviewCost: [Int!]!
    total: Int
    weekly: Int
  }
  type ListItemDelete {
    page: PageListStandard!
    id: Int!
    overviewCost: [Int!]!
    total: Int
    weekly: Int
  }

  type ReceiptItem {
    page: ReceiptPage!
    id: Int!
    date: Date!
    item: String!
    category: String!
    cost: Int!
    shop: String!
  }

  extend type Subscription {
    listItemCreated(pages: [PageListStandard!]!): ListItemCreateUpdate!
    listItemUpdated(pages: [PageListStandard!]!): ListItemCreateUpdate!
    listItemDeleted: ListItemDelete!

    receiptCreated: ReceiptCreated!
  }
`;

export const listSchema = gql`
  ${query}
  ${mutation}
  ${subscription}
`;
