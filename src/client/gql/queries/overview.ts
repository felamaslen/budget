import { gql } from 'urql';

export const overviewOld = gql`
  query OverviewOld($now: Date) {
    overviewOld(now: $now) {
      startDate
      stocks
      pension
      cashOther
      investments
      homeEquity
      options
      netWorth
      income
      spending
    }
  }
`;
