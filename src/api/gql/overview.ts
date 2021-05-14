import gql from 'graphql-tag';

export const overviewSchema = gql`
  enum MonthlyCategory {
    stocks
    income
    spending
    bills
    food
    general
    holiday
    social
  }

  type Monthly {
    stocks: [Int!]!
    investmentPurchases: [Int!]!
    income: [Int!]!
    bills: [Int!]!
    food: [Int!]!
    general: [Int!]!
    holiday: [Int!]!
    social: [Int!]!
  }

  type InitialCumulativeValues {
    income: Int!
    spending: Int!
  }

  type Overview {
    startDate: Date!
    endDate: Date!
    annualisedFundReturns: Float!
    monthly: Monthly!
    initialCumulativeValues: InitialCumulativeValues!
  }

  type OverviewOld {
    startDate: Date!
    assets: [Int!]!
    liabilities: [Int!]!
    netWorth: [Int!]!
    stocks: [Int!]!
    investmentPurchases: [Int!]!
    pension: [Int!]!
    cashOther: [Int!]!
    investments: [Int!]!
    illiquidEquity: [Int!]!
    options: [Int!]!
    income: [Int!]!
    spending: [Int!]!
  }

  type OverviewPreview {
    startDate: Date!
    values: [Int!]!
  }

  extend type Query {
    overview(now: Date): Overview
    overviewOld(now: Date): OverviewOld

    overviewPreview(category: MonthlyCategory!, date: Date!): OverviewPreview
  }
`;
