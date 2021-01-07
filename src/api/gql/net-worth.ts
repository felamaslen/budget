import gql from 'graphql-tag';

const Category = gql`
  enum NetWorthCategoryType {
    asset
    liability
  }

  type NetWorthCategory {
    id: Int!
    type: NetWorthCategoryType!
    category: String!
    color: String!
    isOption: Boolean
  }

  input NetWorthCategoryInput {
    type: NetWorthCategoryType!
    category: String!
    color: String!
    isOption: Boolean
  }

  extend type Query {
    readNetWorthCategories(id: Int): [NetWorthCategory!]
  }

  extend type Mutation {
    createNetWorthCategory(input: NetWorthCategoryInput!): CrudResponseCreate
    updateNetWorthCategory(id: Int!, input: NetWorthCategoryInput!): CrudResponseUpdate
    deleteNetWorthCategory(id: Int!): CrudResponseDelete
  }
`;

const Subcategory = gql`
  type NetWorthSubcategory {
    id: Int!
    categoryId: Int!
    subcategory: String!
    hasCreditLimit: Boolean
    isSAYE: Boolean
    opacity: Float
  }

  input NetWorthSubcategoryInput {
    categoryId: Int!
    subcategory: String!
    hasCreditLimit: Boolean
    isSAYE: Boolean
    opacity: Float
  }

  extend type Query {
    readNetWorthSubcategories(id: Int): [NetWorthSubcategory!]
  }

  extend type Mutation {
    createNetWorthSubcategory(input: NetWorthSubcategoryInput!): CrudResponseCreate
    updateNetWorthSubcategory(id: Int!, input: NetWorthSubcategoryInput!): CrudResponseUpdate
    deleteNetWorthSubcategory(id: Int!): CrudResponseDelete
  }
`;

const Value = gql`
  type SimpleValue {
    value: Int!
  }

  type FXValue {
    value: Float!
    currency: String!
  }
  input FXValueInput {
    value: Float!
    currency: String!
  }

  type OptionValue {
    units: NonNegativeInt!
    strikePrice: NonNegativeFloat!
    marketPrice: NonNegativeFloat!
    vested: NonNegativeInt!
  }
  input OptionValueInput {
    units: NonNegativeInt!
    strikePrice: NonNegativeFloat!
    marketPrice: NonNegativeFloat!
    vested: NonNegativeInt
  }

  type MortgageValue {
    principal: NonNegativeInt!
    paymentsRemaining: NonNegativeInt!
    rate: Float!
  }
  input MortgageValueInput {
    principal: NonNegativeInt!
    paymentsRemaining: NonNegativeInt!
    rate: Float!
  }

  type NetWorthValueObject {
    subcategory: Int!
    skip: Boolean

    value: Int!

    simple: Int
    fx: [FXValue!]
    option: OptionValue
    mortgage: MortgageValue
  }

  input NetWorthValueInput {
    subcategory: Int!
    skip: Boolean

    simple: Int
    fx: [FXValueInput!]
    option: OptionValueInput
    mortgage: MortgageValueInput
  }
`;

const CreditLimit = gql`
  type CreditLimit {
    subcategory: Int!
    value: Int!
  }

  input CreditLimitInput {
    subcategory: Int!
    value: Int!
  }
`;

const Currency = gql`
  type Currency {
    currency: String!
    rate: NonNegativeFloat!
  }

  input CurrencyInput {
    currency: String!
    rate: NonNegativeFloat!
  }
`;

const Entry = gql`
  ${Value}
  ${CreditLimit}
  ${Currency}

  type NetWorthEntry {
    id: Int!
    date: Date!
    values: [NetWorthValueObject!]!
    creditLimit: [CreditLimit!]!
    currencies: [Currency!]!
  }

  input NetWorthEntryInput {
    date: Date!
    values: [NetWorthValueInput!]!
    creditLimit: [CreditLimitInput!]!
    currencies: [CurrencyInput!]!
  }

  type NetWorthEntryOverview {
    current: [NetWorthEntry!]!
    old: [Int!]!
    oldOptions: [Int!]!
  }

  type NetWorthCategoryCreated {
    error: String
    item: NetWorthCategory
  }
  type NetWorthCategoryUpdated {
    error: String
    item: NetWorthCategory
  }
  type NetWorthSubcategoryCreated {
    error: String
    item: NetWorthSubcategory
  }
  type NetWorthSubcategoryUpdated {
    error: String
    item: NetWorthSubcategory
  }
  type NetWorthEntryCreated {
    error: String
    item: NetWorthEntry
  }
  type NetWorthEntryUpdated {
    error: String
    item: NetWorthEntry
  }
  type NetWorthDeleted {
    error: String
    id: Int!
  }

  extend type Query {
    readNetWorthEntries: NetWorthEntryOverview
  }

  extend type Mutation {
    createNetWorthEntry(input: NetWorthEntryInput!): CrudResponseCreate
    updateNetWorthEntry(id: Int!, input: NetWorthEntryInput!): CrudResponseUpdate
    deleteNetWorthEntry(id: Int!): CrudResponseDelete
  }

  extend type Subscription {
    netWorthCategoryCreated: NetWorthCategoryCreated!
    netWorthCategoryUpdated: NetWorthCategoryUpdated!
    netWorthCategoryDeleted: NetWorthDeleted!

    netWorthSubcategoryCreated: NetWorthSubcategoryCreated!
    netWorthSubcategoryUpdated: NetWorthSubcategoryUpdated!
    netWorthSubcategoryDeleted: NetWorthDeleted!

    netWorthEntryCreated: NetWorthEntryCreated!
    netWorthEntryUpdated: NetWorthEntryUpdated!
    netWorthEntryDeleted: NetWorthDeleted!
  }
`;

export const netWorthSchema = gql`
  ${Category}
  ${Subcategory}
  ${Entry}
`;
