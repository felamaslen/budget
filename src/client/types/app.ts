import type { PageListStandard } from './gql';
import type { PageNonStandard } from '~shared/constants';

export type Page = PageNonStandard | PageListStandard;

export type PageList = PageNonStandard.Funds | PageListStandard;
