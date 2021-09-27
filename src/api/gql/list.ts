import gql from 'graphql-tag';

const query = gql`
  enum PageListStandard {
    income
    bills
    food
    general
    social
    holiday
  }

  type ListItem {
    id: Int!
    item: String!
  }
  type ListItemStandard {
    id: Int!
    date: Date!
    item: String!
    category: String!
    cost: Int!
    shop: String!
  }
  type ListReadResponse {
    error: String
    items: [ListItemStandard!]!
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
    category: String!
    shop: String!
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
  type ListItemStandardCreatedSubscription {
    fakeId: Int!
    item: ListItemStandard!
  }

  type ListSubscription {
    page: PageListStandard!

    created: ListItemStandardCreatedSubscription
    updated: ListItemStandard
    deleted: NonNegativeInt

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
    listChanged(pages: [PageListStandard!]!): ListSubscription!

    receiptCreated: ReceiptCreated!
  }
`;

export const listSchema = gql`
  ${query}
  ${mutation}
  ${subscription}
`;
