import type { PageListStandard, ReceiptPage } from './gql';
import type { PageNonStandard } from '~shared/constants';

export type PageListCost = PageListStandard | ReceiptPage;

export type PageList = PageNonStandard.Funds | PageListCost;

export type Page = PageNonStandard | PageListCost;
