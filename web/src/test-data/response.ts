import getUnixTime from 'date-fns/getUnixTime';
import numericHash from 'string-hash';
import { Page, ReadResponse, StocksListResponse, StockPrice, LoginResponse } from '~client/types';

export const testLoginResponse: LoginResponse = {
  uid: numericHash('some-uid'),
  apiKey: 'some-api-key',
  name: 'John Doe',
  expires: new Date('2050-03-05').toISOString(),
};

export const testResponse: ReadResponse = {
  appConfig: {
    birthDate: '1996-02-03',
    pieTolerance: 0.08,
  },
  [Page.overview]: {
    startYearMonth: [2018, 10],
    endYearMonth: [2020, 4],
    currentYear: 2020,
    currentMonth: 1,
    futureMonths: 3,
    annualisedFundReturns: 0.173,
    homeEquityOld: [6375000, 7255000],
    cost: {
      [Page.funds]: [],
      [Page.income]: [],
      [Page.bills]: [],
      [Page.food]: [],
      [Page.general]: [],
      [Page.holiday]: [],
      [Page.social]: [],
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
    cashTarget: 20000,
    annualisedFundReturns: 0.653,
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

export const testStocksList: StocksListResponse = {
  data: {
    stocks: [
      ['CD1', 'stock name 1', 965],
      ['CD2', 'stock name 2', 193],
    ],
    total: 1032,
  },
};

export const testStockPrices: StockPrice[] = [
  { code: 'SMT', open: 730.2, close: 739.1 },
  { code: 'CTY', open: 338.9, close: 332.6 },
];
