import gql from 'graphql-tag';

export const overviewSchema = gql`
  type Monthly {
    stocks: [Int!]!
    income: [Int!]!
    bills: [Int!]!
    food: [Int!]!
    general: [Int!]!
    holiday: [Int!]!
    social: [Int!]!
  }

  type Overview {
    startDate: DateTime!
    endDate: DateTime!
    annualisedFundReturns: Float!
    monthly: Monthly!
  }

  type OverviewOld {
    startDate: DateTime!
    stocks: [Int!]!
    pension: [Int!]!
    lockedCash: [Int!]!
    homeEquity: [Int!]!
    options: [Int!]!
    netWorth: [Int!]!
    income: [Int!]!
    spending: [Int!]!
  }

  extend type Query {
    overview(now: Date): Overview
    overviewOld(now: Date): OverviewOld
  }
`;
