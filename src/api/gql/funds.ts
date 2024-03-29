import gql from 'graphql-tag';

export const fundsSchema = gql`
  type Transaction {
    date: Date!
    units: Float!
    price: NonNegativeFloat!
    fees: Int!
    taxes: Int!
    drip: Boolean!
    pension: Boolean!
  }
  input TransactionInput {
    date: Date!
    units: Float!
    price: NonNegativeFloat!
    fees: Int!
    taxes: Int!
    drip: Boolean!
    pension: Boolean!
  }

  type StockSplit {
    date: Date!
    ratio: NonNegativeFloat!
  }
  input StockSplitInput {
    date: Date!
    ratio: NonNegativeFloat!
  }

  type Fund {
    id: Int!
    item: String!
    transactions: [Transaction!]!
    allocationTarget: NonNegativeInt
    stockSplits: [StockSplit!]!
  }

  input FundInput {
    item: String!
    transactions: [TransactionInput!]!
    allocationTarget: NonNegativeInt
    stockSplits: [StockSplitInput!]
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
    ytd
  }

  enum FundMode {
    ROI
    Value
    Stacked
    Allocation
    Price
    PriceNormalised
    Calendar
    Candlestick
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

  type FundHistoryCandlestickGroup {
    id: Int!
    t0: Int!
    t1: Int!
    min: Float!
    max: Float!
    start: Float!
    end: Float!
  }

  type FundHistoryCandlestick {
    period: FundPeriod!
    length: NonNegativeInt!
    candles: [FundHistoryCandlestickGroup!]!
  }

  type FundValueIndividual {
    date: Int!
    price: NonNegativeFloat!
  }

  type FundHistoryIndividual {
    values: [FundValueIndividual!]!
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
    refreshTime: DateTime
  }

  type StockValueResponse {
    error: String
    latestValue: Int
    previousValue: Int
    refreshTime: DateTime
  }

  extend type Query {
    readFunds: ReadFundsResponse
    cashAllocationTarget: NonNegativeInt
    fundHistory(period: FundPeriod, length: NonNegativeInt): FundHistory
    fundHistoryIndividual(id: NonNegativeInt!): FundHistoryIndividual
    fundHistoryCandlestick(period: FundPeriod, length: NonNegativeInt): FundHistoryCandlestick

    stockPrices(codes: [String!]!): StockPricesResponse
    stockValue: StockValueResponse
  }

  extend type Mutation {
    createFund(fakeId: Int!, input: FundInput!): CrudResponseCreate
    updateFund(id: Int!, input: FundInput!): CrudResponseUpdate
    deleteFund(id: Int!): CrudResponseDelete
    updateCashAllocationTarget(target: NonNegativeInt!): CrudResponseUpdate
    updateFundAllocationTargets(deltas: [TargetDelta!]!): UpdatedFundAllocationTargets
  }

  type FundCreatedSubscription {
    fakeId: Int!
    item: Fund!
  }

  type FundSubscription {
    created: FundCreatedSubscription
    updated: Fund
    deleted: NonNegativeInt

    overviewCost: [Int!]!
  }

  extend type Subscription {
    fundsChanged: FundSubscription!

    fundPricesUpdated(period: FundPeriod, length: NonNegativeInt): FundHistory
    cashAllocationTargetUpdated: NonNegativeInt!
    fundAllocationTargetsUpdated: UpdatedFundAllocationTargets!
  }
`;
