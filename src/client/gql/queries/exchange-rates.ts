import { gql } from 'urql';

export const ExchangeRates = gql`
  query ExchangeRates($base: String!) {
    exchangeRates(base: $base) {
      error
      rates {
        currency
        rate
      }
    }
  }
`;
