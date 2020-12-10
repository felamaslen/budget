import { PageListExtended, PageListStandard } from './gql';

export enum PageNonStandard {
  Overview = 'overview',
  Analysis = 'analysis',
  Funds = 'funds',
}

export type PageListCost = PageListStandard | PageListExtended;

export type Page = PageNonStandard | PageListStandard | PageListExtended;

export type PageList = PageNonStandard.Funds | PageListCost;
