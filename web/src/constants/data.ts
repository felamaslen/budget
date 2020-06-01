import { Page, PageList, PageListCalc, Pages, CostProcessed } from '~client/types';

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

const PAGES_LIST_CALC: PageListCalc[] = [
  Page.income,
  Page.bills,
  Page.food,
  Page.general,
  Page.holiday,
  Page.social,
];
export const PAGES_LIST: PageList[] = [Page.funds, ...PAGES_LIST_CALC];

export const isPage = <T extends string>(name?: T | Page): name is Page =>
  !!name && Reflect.has(PAGES, name);

export const isCalcPage = <T extends string>(name?: T | Page): name is PageListCalc =>
  !!name && (PAGES_LIST_CALC as string[]).includes(name);
