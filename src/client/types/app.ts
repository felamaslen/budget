import type { PageListStandard } from './gql';

export enum PageNonStandard {
  Overview = 'overview',
  Analysis = 'analysis',
  Funds = 'funds',
}

export type Page = PageNonStandard | PageListStandard;

export type PageList = PageNonStandard.Funds | PageListStandard;
