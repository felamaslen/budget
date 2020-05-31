import getUnixTime from 'date-fns/getUnixTime';
import { Page, ReadResponse, StocksListResponse, StockPrice, LoginResponse } from '~client/types';

export const testLoginResponse: LoginResponse = {
  uid: 'some-uid',
  apiKey: 'some-api-key',
  name: 'John Doe',
  expires: new Date('2050-03-05').toISOString(),
};

export const testResponse: ReadResponse = {
  [Page.overview]: {
    startYearMonth: [2018, 10],
    endYearMonth: [2020, 4],
    currentYear: 2020,
    currentMonth: 1,
    futureMonths: 3,
    cost: {
      [Page.funds]: [],
      fundChanges: [],
      [Page.income]: [],
      [Page.bills]: [],
      [Page.food]: [],
      [Page.general]: [],
      [Page.holiday]: [],
      [Page.social]: [],
      balance: [],
      old: [],
    },
  },
  netWorth: {
    categories: {
      data: [],
    },
    subcategories: {
      data: [],
    },
    entries: {
      data: {
        items: [],
        old: [],
        oldOptions: [],
      },
    },
  },
  [Page.funds]: {
    data: [],
    startTime: getUnixTime(new Date('2017-02-03')),
    cacheTimes: [],
  },
  [Page.income]: {
    data: [],
    total: 0,
  },
  [Page.bills]: {
    data: [],
    total: 0,
  },
  [Page.food]: {
    data: [],
    total: 0,
  },
  [Page.general]: {
    data: [],
    total: 0,
  },
  [Page.holiday]: {
    data: [],
    total: 0,
  },
  [Page.social]: {
    data: [],
    total: 0,
  },
};

export const testStocksList = {
  data: {
    stocks: [
      ['CD1', 'stock name 1', 965],
      ['CD2', 'stock name 2', 193],
    ],
    total: 1032,
  },
} as StocksListResponse;

export const testStockPrices = [
  { code: 'SMT', open: 730.2, close: 739.1 },
  { code: 'CTY', open: 338.9, close: 332.6 },
] as StockPrice[];
