import {
  OverviewHeader,
  OverviewColumn,
  OverviewTableColumn,
  Page,
  PageListStandard,
  PageNonStandard,
  PageList,
  PageListExtended,
  SearchPage,
  AnalysisPage,
} from '~client/types';

// debounce requests to update the server by 1 second
export const TIMER_UPDATE_SERVER = 1000;

export const API_PREFIX = '/api/v4';
export const API_BACKOFF_TIME = 5000;

export const LOGIN_INPUT_LENGTH = 4;

export const CREATE_ID = -2;

const overviewColumns: { [header in OverviewHeader]?: OverviewColumn } = {
  funds: { name: 'Stocks' },
  [PageListStandard.Bills]: { name: 'Bills' },
  [PageListStandard.Food]: { name: 'Food' },
  [PageListStandard.General]: { name: 'General' },
  [PageListStandard.Holiday]: { name: 'Holiday' },
  [PageListStandard.Social]: { name: 'Social' },
  [PageListStandard.Income]: { name: 'Income' },
  spending: { name: 'Out' },
  net: { name: 'Net' },
  netWorthCombined: {
    name: 'Net Worth',
    link: {
      to: '/net-worth',
      replace: true,
    },
  },
};

export const OVERVIEW_COLUMNS = Object.entries(overviewColumns) as OverviewTableColumn[];

const PAGES_NON_STANDARD: PageNonStandard[] = Object.values(PageNonStandard);
const PAGES_LIST_STANDARD: PageListStandard[] = Object.values(PageListStandard);
const PAGES_LIST_EXTENDED: PageListExtended[] = Object.values(PageListExtended);
const PAGES_SEARCH: SearchPage[] = Object.values(SearchPage);
const PAGES_ANALYSIS: AnalysisPage[] = Object.values(AnalysisPage);

export const PAGES_LIST: PageList[] = [PageNonStandard.Funds, ...PAGES_LIST_STANDARD];

export const PAGE_LIST_LIMIT = 100;

export const IGNORE_EXPENSE_CATEGORIES = ['House purchase'];

export const isPage = <T extends string>(name?: T | Page): name is Page =>
  !!name &&
  ((PAGES_NON_STANDARD as string[]).includes(name) ||
    (PAGES_LIST_STANDARD as string[]).includes(name));

export const isStandardListPage = <T extends string>(name?: T | Page): name is PageListStandard =>
  !!name && (PAGES_LIST_STANDARD as string[]).includes(name);

export const isExtendedListPage = <T extends string>(name?: T | Page): name is PageListExtended =>
  !!name && (PAGES_LIST_EXTENDED as string[]).includes(name);

export const isSearchPage = <T extends string>(name?: T | SearchPage): name is SearchPage =>
  !!name && (PAGES_SEARCH as string[]).includes(name);

export const isAnalysisPage = <T extends string>(name?: T | AnalysisPage): name is AnalysisPage =>
  !!name && (PAGES_ANALYSIS as string[]).includes(name);
