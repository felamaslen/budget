import { gql } from 'urql';

export const FundParts = gql`
  fragment FundParts on Fund {
    id
    item
    allocationTarget
    transactions {
      date
      units
      price
      fees
      taxes
      drip
      pension
    }
    stockSplits {
      date
      ratio
    }
  }
`;

export const FundHistoryParts = gql`
  fragment FundHistoryParts on FundHistory {
    startTime
    cacheTimes
    prices {
      fundId
      groups {
        startIndex
        values
      }
    }
    annualisedFundReturns
    overviewCost
  }
`;
