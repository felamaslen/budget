import gql from 'graphql-tag';

const query = gql`
  type IncomeDeduction {
    name: String!
    value: Int!
  }

  type Income {
    id: Int!
    date: Date!
    item: String!
    category: String!
    cost: Int!
    shop: String!
    deductions: [IncomeDeduction!]!
  }
  type IncomeReadResponse {
    error: String
    items: [Income!]!
    olderExists: Boolean
    weekly: Int
    total: Int
    totalDeductions: [IncomeDeduction!]
  }
  extend type Query {
    readIncome(offset: Int, limit: Int): IncomeReadResponse
  }
`;

const mutation = gql`
  input IncomeDeductionInput {
    name: String!
    value: Int!
  }

  input IncomeInput {
    date: String!
    item: String!
    cost: Int!
    category: String!
    shop: String!
    deductions: [IncomeDeductionInput!]!
  }

  extend type Mutation {
    createIncome(fakeId: Int!, input: IncomeInput!): CrudResponseCreate
    updateIncome(id: Int!, input: IncomeInput!): CrudResponseUpdate
    deleteIncome(id: Int!): CrudResponseDelete
  }
`;

const subscription = gql`
  type IncomeCreatedSubscription {
    fakeId: Int!
    item: Income!
  }

  type IncomeSubscription {
    created: IncomeCreatedSubscription
    updated: Income
    deleted: NonNegativeInt

    overviewCost: [Int!]!
    weekly: Int
    total: Int
    totalDeductions: [IncomeDeduction!]
  }

  extend type Subscription {
    incomeChanged: IncomeSubscription!
  }
`;

export const incomeSchema = gql`
  ${query}
  ${mutation}
  ${subscription}
`;
