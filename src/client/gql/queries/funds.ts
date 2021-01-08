import { gql } from 'urql';

export const FundPricesUpdate = gql`
  query FundPricesUpdate($period: FundPeriod, $length: NonNegativeInt) {
    fundHistory(period: $period, length: $length) {
      ...FundHistoryParts
    }
  }
`;

export const StockPrices = gql`
  query StockPrices($codes: [String!]!) {
    stockPrices(codes: $codes) {
      prices {
        code
        price
      }
      refreshTime
    }
  }
`;
