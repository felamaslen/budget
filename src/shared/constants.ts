import { FundMode, FundPeriod } from '~client/types/gql';

export enum PageNonStandard {
  Overview = 'overview',
  Planning = 'planning',
  Analysis = 'analysis',
  Funds = 'funds',
}

export enum NetWorthAggregate {
  cashEasyAccess = 'Cash (easy access)',
  cashOther = 'Cash (other)',
  stocks = 'Stocks', // this is actually stock+cash investments
  pension = 'Pension',
  realEstate = 'House',
  mortgage = 'Mortgage',
}

// List of cost categories which should count as investments, rather than pure expense
export const investmentPurchaseCategories = ['House purchase'];

export const defaultRealTimePrices = true;

export const defaultFundMode = FundMode.Roi;
export const defaultFundPeriod = FundPeriod.Year;
export const defaultFundLength = 1;

export const defaultBirthDate = '1990-01-01';
