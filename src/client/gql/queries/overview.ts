import { gql } from 'urql';

export const overviewOld = gql`
  query OverviewOld($now: Date) {
    overviewOld(now: $now) {
      startDate
      stocks
      investmentPurchases
      pension
      cashOther
      investments
      homeEquity
      assets
      liabilities
      options
      netWorth
      income
      spending
    }
  }
`;

export const overviewPreview = gql`
  query OverviewPreview($category: MonthlyCategory!, $date: Date!) {
    overviewPreview(category: $category, date: $date) {
      startDate
      values
    }
  }
`;
