import { gql } from 'urql';

export const overviewOld = gql`
  query OverviewOld($now: Date) {
    overviewOld(now: $now) {
      startDate
      stocks
      investmentPurchases
      pension
      cashLiquid
      cashOther
      investments
      illiquidEquity
      assets
      liabilities
      options
      netWorth
      income
      spending
    }
  }
`;
