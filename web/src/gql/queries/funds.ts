import gql from 'graphql-tag';

export const FundPricesUpdate = gql`
  query FundPricesUpdate($period: FundPeriod, $length: NonNegativeInt) {
    fundHistory(period: $period, length: $length) {
      ...FundHistoryParts
    }
  }
`;
