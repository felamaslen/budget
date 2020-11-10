import {
  Page,
  PageList,
  PageListCalc,
  Pages,
  OverviewHeader,
  OverviewColumn,
  OverviewTableColumn,
  ExtendedCalcItem,
} from '~client/types';

// debounce requests to update the server by 1 second
export const TIMER_UPDATE_SERVER = 1000;

export const API_PREFIX = '/api/v4';
export const API_BACKOFF_TIME = 5000;

export const LOGIN_INPUT_LENGTH = 4;

export const CREATE_ID = -2;

const overviewColumns: { [header in OverviewHeader]?: OverviewColumn } = {
  [Page.funds]: { name: 'Stocks' },
  [Page.bills]: { name: 'Bills' },
  [Page.food]: { name: 'Food' },
  [Page.general]: { name: 'General' },
  [Page.holiday]: { name: 'Holiday' },
  [Page.social]: { name: 'Social' },
  [Page.income]: { name: 'Income' },
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

const pageDefinitionExtended = {
  list: true,
  cols: ['date', 'item', 'category', 'cost', 'shop'] as (keyof ExtendedCalcItem)[],
  daily: true,
  suggestions: ['item', 'category', 'shop'],
};

export const PAGES: Pages = {
  [Page.overview]: {
    path: '/',
    cols: ['balance'],
  },
  [Page.analysis]: {},
  [Page.funds]: {
    list: true,
    cols: ['item', 'transactions'],
  },
  [Page.income]: {
    list: true,
    cols: ['date', 'item', 'cost'],
  },
  [Page.bills]: {
    list: true,
    cols: ['date', 'item', 'cost'],
    suggestions: ['item'],
  },
  [Page.food]: pageDefinitionExtended,
  [Page.general]: pageDefinitionExtended,
  [Page.holiday]: pageDefinitionExtended,
  [Page.social]: pageDefinitionExtended,
};

const PAGES_LIST_CALC: PageListCalc[] = [
  Page.income,
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
];
export const PAGES_LIST: PageList[] = [Page.funds, ...PAGES_LIST_CALC];

export const IGNORE_EXPENSE_CATEGORIES = ['House purchase'];

export const isPage = <T extends string>(name?: T | Page): name is Page =>
  !!name && Reflect.has(PAGES, name);

export const isCalcPage = <T extends string>(name?: T | Page): name is PageListCalc =>
  !!name && (PAGES_LIST_CALC as string[]).includes(name);
