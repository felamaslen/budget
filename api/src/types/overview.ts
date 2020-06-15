import { ListCategory } from './shared';

export type OverviewResponse = {
  startYearMonth: [number, number];
  endYearMonth: [number, number];
  currentYear: number;
  currentMonth: number;
  futureMonths: number;
  annualisedFundReturns: number;
  cost: {
    [category in ListCategory]: number[];
  };
};
