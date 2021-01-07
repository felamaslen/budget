import gql from 'graphql-tag';

export const fundsSchema = gql`
  type Transaction {
    date: Date!
    units: Float!
    price: NonNegativeFloat!
    fees: Int!
    taxes: Int!
  }
  input TransactionInput {
    date: Date!
    units: Float!
    price: NonNegativeFloat!
    fees: Int!
    taxes: Int!
  }

  type Fund {
    id: Int!
    item: String!
    transactions: [Transaction!]!
    allocationTarget: NonNegativeInt
  }
  type FundData {
    item: String!
    transactions: [Transaction!]!
    allocationTarget: NonNegativeInt
  }

  input FundInput {
    item: String!
    transactions: [TransactionInput!]!
    allocationTarget: NonNegativeInt
  }

  type FundPriceGroup {
    startIndex: Int!
    values: [NonNegativeFloat!]!
  }

  type FundPrices {
    fundId: Int!
    groups: [FundPriceGroup!]!
  }

  enum FundPeriod {
    year
    month
  }

  type ReadFundsResponse {
    items: [Fund!]!
  }

  type FundHistory {
    startTime: Int!
    cacheTimes: [Int!]!
    prices: [FundPrices!]!
    annualisedFundReturns: Float!
    overviewCost: [Int!]!
  }

  input TargetDelta {
    id: Int!
    allocationTarget: NonNegativeInt!
  }

  type TargetDeltaResponse {
    id: Int!
    allocationTarget: NonNegativeInt!
  }

  type UpdatedFundAllocationTargets {
    error: String
    deltas: [TargetDeltaResponse!]
  }

  type StockPrice {
    code: String!
    price: NonNegativeFloat
  }

  type StockPricesResponse {
    error: String
    prices: [StockPrice!]!
  }

  extend type Query {
    readFunds: ReadFundsResponse
    cashAllocationTarget: NonNegativeInt
    fundHistory(period: FundPeriod, length: NonNegativeInt): FundHistory

    stockPrices(codes: [String!]!): StockPricesResponse
  }

  extend type Mutation {
    createFund(fakeId: Int!, input: FundInput!): CrudResponseCreate
    updateFund(id: Int!, input: FundInput!): CrudResponseUpdate
    deleteFund(id: Int!): CrudResponseDelete
    updateCashAllocationTarget(target: NonNegativeInt!): CrudResponseUpdate
    updateFundAllocationTargets(deltas: [TargetDelta!]!): UpdatedFundAllocationTargets
  }

  type FundCreateUpdate {
    id: Int!
    fakeId: Int
    item: FundData!
    overviewCost: [Int!]!
  }
  type FundDelete {
    id: Int!
    overviewCost: [Int!]!
  }

  extend type Subscription {
    fundCreated: FundCreateUpdate!
    fundUpdated: FundCreateUpdate!
    fundDeleted: FundDelete!

    fundPricesUpdated(period: FundPeriod, length: NonNegativeInt): FundHistory
    cashAllocationTargetUpdated: NonNegativeInt!
    fundAllocationTargetsUpdated: UpdatedFundAllocationTargets!
  }
`;
