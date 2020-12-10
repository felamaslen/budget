import { AnalysisPage, PageListStandard, PageListExtended, ReceiptPage } from './gql';

export enum PageNonStandard {
  Overview = 'overview',
  Analysis = 'analysis',
  Funds = 'funds',
}

export type PageListCost = PageListStandard | PageListExtended | ReceiptPage;

export type PageList = PageNonStandard.Funds | PageListCost;

export type Page = PageNonStandard | PageListCost;

export const isExtendedPage = (
  page: PageListStandard | PageListExtended | AnalysisPage,
): page is PageListExtended =>
  (Object.values(PageListExtended) as string[]).includes(page as string);
