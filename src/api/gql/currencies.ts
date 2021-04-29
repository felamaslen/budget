import gql from 'graphql-tag';

export const currenciesSchema = gql`
  type ExchangeRate {
    currency: String!
    rate: NonNegativeFloat!
  }

  type ExchangeRatesResponse {
    error: String
    rates: [ExchangeRate!]
  }

  extend type Query {
    exchangeRates(base: String!): ExchangeRatesResponse
  }
`;
