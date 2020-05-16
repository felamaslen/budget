import { Page, PageList, PageListCalc } from '~client/types/app';
import { Pages, Column } from '~client/types/list';
import { CostProcessed } from '~client/types/overview';

// debounce requests to update the server by 1 second
export const TIMER_UPDATE_SERVER = 1000;

export const API_PREFIX = '/api/v4';
export const API_BACKOFF_TIME = 5000;

export const LOGIN_INPUT_LENGTH = 4;

export const CREATE_ID = 'CREATE_ID';

export type OverviewHeader = 'month' & Exclude<keyof CostProcessed, 'fundsOld'>;

export type OverviewColumn = {
  name: string;
  link?: {
    to: string;
    replace?: boolean;
  };
};

export const OVERVIEW_COLUMNS: Record<OverviewHeader, OverviewColumn> = {
  month: { name: 'Month' },
  funds: { name: 'Stocks' },
  bills: { name: 'Bills' },
  food: { name: 'Food' },
  general: { name: 'General' },
  holiday: { name: 'Holiday' },
  social: { name: 'Social' },
  income: { name: 'Income' },
  spending: { name: 'Out' },
  net: { name: 'Net' },
  netWorthPredicted: { name: 'Predicted' },
  netWorth: {
    name: 'Net Worth',
    link: {
      to: '/net-worth',
      replace: true,
    },
  },
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
  [Page.food]: {
    list: true,
    cols: ['date', 'item', 'category', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'category', 'shop'],
  },
  [Page.general]: {
    list: true,
    cols: ['date', 'item', 'category', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'category', 'shop'],
  },
  [Page.holiday]: {
    list: true,
    cols: ['date', 'item', 'holiday', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'holiday', 'shop'],
  },
  [Page.social]: {
    list: true,
    cols: ['date', 'item', 'society', 'cost', 'shop'],
    daily: true,
    suggestions: ['item', 'society', 'shop'],
  },
};

export const getColumns = <I extends {}>(page?: PageList): Column<I>[] =>
  (page && ((PAGES[page].cols ?? []) as Column<I>[])) ?? [];

export const PAGES_LIST_CALC: PageListCalc[] = [
  Page.income,
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
];
export const PAGES_LIST: PageList[] = [Page.funds, ...PAGES_LIST_CALC];
export const PAGES_SUGGESTIONS = PAGES_LIST_CALC;

export const LIST_COLS_MOBILE = ['date', 'item', 'cost'];

// maximum number of search suggestions to request
export const MAX_SUGGESTIONS = 5;

export const NET_WORTH_AGGREGATE = {
  'cash-easy-access': 'Cash (easy access)',
  'cash-other': 'Cash (other)',
  stocks: 'Stocks',
  pension: 'Pension',
};
