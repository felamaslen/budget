import { gql } from 'urql';

export const overviewOldUpdated = gql`
  subscription OverviewOldUpdated {
    overviewOld {
      startDate
      stocks
      pension
      lockedCash
      homeEquity
      options
      netWorth
      income
      spending
    }
  }
`;
