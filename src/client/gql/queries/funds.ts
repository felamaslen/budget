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

export const FundHistoryCandlestick = gql`
  query FundHistoryCandlestick($period: FundPeriod, $length: NonNegativeInt) {
    fundHistoryCandlestick(period: $period, length: $length) {
      period
      length
      candles {
        id
        t0
        t1
        min
        max
        start
        end
      }
    }
  }
`;

export const FundHistoryIndividual = gql`
  query FundHistoryIndividual($id: NonNegativeInt!) {
    fundHistoryIndividual(id: $id) {
      values {
        date
        price
      }
    }
  }
`;
