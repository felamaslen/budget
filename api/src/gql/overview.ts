import gql from 'graphql-tag';

export const overviewSchema = gql`
  type Cost {
    funds: [Int!]!
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
    homeEquityOld: [Int!]!
    cost: Cost!
  }

  extend type Query {
    overview(now: Date): Overview
  }
`;
