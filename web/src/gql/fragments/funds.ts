import gql from 'graphql-tag';

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
