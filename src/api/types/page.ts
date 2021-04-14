import { PageListStandard, ReceiptPage } from './gql';

export enum PageNonStandard {
  Overview = 'overview',
  Analysis = 'analysis',
  Funds = 'funds',
}

export type PageListCost = PageListStandard | ReceiptPage;

export type PageList = PageNonStandard.Funds | PageListCost;

export type Page = PageNonStandard | PageListCost;
