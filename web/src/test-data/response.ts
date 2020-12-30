import getUnixTime from 'date-fns/getUnixTime';

import { InitialQuery, PageListStandard, PageNonStandard, StocksListResponse } from '~client/types';

export const testResponse: InitialQuery = {
  config: {
    birthDate: '1996-02-03',
    futureMonths: 12,
  },

  overview: {
    startDate: '2018-10-31T23:59:59.999Z',
    endDate: '2020-04-30T23:59:59.999+0100',
    annualisedFundReturns: 0.173,
    homeEquityOld: [6375000, 7255000],
    cost: {
      funds: [],
      [PageListStandard.Income]: [],
      [PageListStandard.Bills]: [],
      [PageListStandard.Food]: [],
      [PageListStandard.General]: [],
      [PageListStandard.Holiday]: [],
      [PageListStandard.Social]: [],
    },
  },

  netWorthCategories: [],
  netWorthSubcategories: [],
  netWorthEntries: {
    current: [],
    old: [],
    oldOptions: [],
  },

  [PageNonStandard.Funds]: { items: [] },

  cashAllocationTarget: 20000,

  fundHistory: {
    startTime: getUnixTime(new Date('2017-02-03')),
    cacheTimes: [],
    prices: [],
    annualisedFundReturns: 0.653,
    overviewCost: [],
  },

  [PageListStandard.Income]: {
    items: [],
    total: 0,
  },
  [PageListStandard.Bills]: {
    items: [],
    total: 0,
  },
  [PageListStandard.Food]: {
    items: [],
    total: 0,
  },
  [PageListStandard.General]: {
    items: [],
    total: 0,
  },
  [PageListStandard.Holiday]: {
    items: [],
    total: 0,
  },
  [PageListStandard.Social]: {
    items: [],
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
