import numericHash from 'string-hash';
import * as funds from './funds';
import { Period as AnalysisPeriod, Grouping as AnalysisGrouping } from '~client/constants/analysis';
import { Period as FundsPeriod } from '~client/constants/graph';
import { State } from '~client/reducers';
import { Page } from '~client/types';

export const testState: State = {
  login: {
    loading: false,
    initialised: true,
    error: null,
    uid: numericHash('some-user-id'),
    name: 'Some user',
  },
  api: {
    initialLoading: false,
    loading: false,
    locked: false,
    error: null,
    key: 'some api key',
  },
  error: [],
  overview: {
    startDate: new Date('2018-01-31T23:59:59.999Z'),
    endDate: new Date('2018-07-31T23:59:59.999Z'),
    annualisedFundReturns: 0.143,
    cost: {
      [Page.funds]: [94004, 105390, 110183, 100779, 101459, 102981, 103293, 0, 0, 0],
      [Page.income]: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
      [Page.bills]: [1000, 900, 400, 650, 0, 0, 0],
      [Page.food]: [50, 13, 20, 19, 0, 0, 0],
      [Page.general]: [150, 90, 10, 35, 0, 0, 0],
      [Page.holiday]: [10, 1000, 95, 13, 0, 0, 0],
      [Page.social]: [50, 65, 134, 10, 0, 0, 0],
    },
  },
  netWorth: {
    categories: {
      items: [
        {
          id: numericHash('real-cash-category-id'),
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
          isOption: false,
        },
        {
          id: numericHash('real-option-category-id'),
          type: 'asset',
          category: 'Options',
          color: '#0a9cff',
          isOption: true,
        },
        {
          id: numericHash('real-mortgage-category-id'),
          type: 'liability',
          category: 'Mortgage',
          color: '#fa0000',
          isOption: false,
        },
        {
          id: numericHash('real-credit-card-category-id'),
          type: 'liability',
          category: 'Credit cards',
          color: '#fc0000',
          isOption: false,
        },
      ],
      __optimistic: [undefined, undefined, undefined, undefined],
    },
    subcategories: {
      items: [
        {
          id: numericHash('real-wallet-subcategory-id'),
          categoryId: numericHash('real-cash-category-id'),
          subcategory: 'My wallet',
          hasCreditLimit: null,
          opacity: 0.2,
        },
        {
          id: numericHash('real-option-subcategory-id'),
          categoryId: numericHash('real-option-category-id'),
          subcategory: 'Some share',
          hasCreditLimit: null,
          opacity: 0.9,
        },
        {
          id: numericHash('real-bank-subcategory-id'),
          categoryId: numericHash('real-cash-category-id'),
          subcategory: 'My bank',
          hasCreditLimit: null,
          opacity: 0.25,
        },
        {
          id: numericHash('real-house-subcategory-id'),
          categoryId: numericHash('real-mortgage-category-id'),
          subcategory: 'My house',
          hasCreditLimit: false,
          opacity: 0.1,
        },
        {
          id: numericHash('real-credit-card-subcategory-id'),
          categoryId: numericHash('real-credit-card-category-id'),
          subcategory: 'My credit card',
          hasCreditLimit: true,
          opacity: 0.3,
        },
      ],
      __optimistic: [undefined, undefined, undefined, undefined, undefined],
    },
    entries: {
      items: [
        {
          id: numericHash('real-entry-id-a'),
          date: new Date('2018-02-28'),
          values: [
            {
              id: numericHash('value-id-a1'),
              subcategory: numericHash('real-wallet-subcategory-id'),
              value: [10324, { currency: 'CZK', value: 37.5 }],
            },
            {
              id: numericHash('value-id-a2'),
              subcategory: numericHash('real-house-subcategory-id'),
              value: -18744200,
              skip: true,
            },
            {
              id: numericHash('value-id-a3'),
              subcategory: numericHash('real-bank-subcategory-id'),
              value: 1296523,
            },
            {
              id: numericHash('value-id-a4'),
              subcategory: numericHash('real-credit-card-subcategory-id'),
              value: -8751,
            },
          ],
          creditLimit: [
            {
              subcategory: numericHash('real-credit-card-subcategory-id'),
              value: 120000,
            },
          ],
          currencies: [{ id: numericHash('currency-id-a1'), currency: 'CZK', rate: 0.035 }],
        },
        {
          id: numericHash('real-entry-id-b'),
          date: new Date('2018-03-31'),
          values: [
            {
              id: numericHash('value-id-b1'),
              subcategory: numericHash('real-wallet-subcategory-id'),
              value: [9752],
            },
            {
              id: numericHash('value-id-b2'),
              subcategory: numericHash('real-house-subcategory-id'),
              value: -18420900,
              skip: true,
            },
            {
              id: numericHash('value-id-b3'),
              subcategory: numericHash('real-bank-subcategory-id'),
              value: 1051343,
            },
            {
              id: numericHash('value-id-b4'),
              subcategory: numericHash('real-credit-card-subcategory-id'),
              value: -21939,
            },
            {
              id: numericHash('value-id-b5'),
              subcategory: numericHash('real-option-subcategory-id'),
              value: [
                {
                  units: 103,
                  vested: 103,
                  strikePrice: 77.65,
                  marketPrice: 95.57,
                },
              ],
            },
          ],
          creditLimit: [
            {
              subcategory: numericHash('real-credit-card-subcategory-id'),
              value: 150000,
            },
          ],
          currencies: [
            { id: numericHash('currency-id-b1'), currency: 'USD', rate: 0.865 },
            { id: numericHash('currency-id-b2'), currency: 'CZK', rate: 0.0314 },
          ],
        },
      ],
      __optimistic: [undefined, undefined],
    },
    old: [],
    oldOptions: [],
  },
  analysis: {
    period: AnalysisPeriod.year,
    grouping: AnalysisGrouping.category,
    loading: false,
    loadingDeep: false,
    page: 0,
    timeline: [[1, 2, 3]],
    cost: [
      [
        Page.food,
        [
          ['foo2_bar2', 137650],
          ['foo2_bar1', 156842],
        ],
      ],
      [Page.general, [['foo1_bar1', 1642283]]],
    ],
    costDeep: null,
    saved: 67123,
    description: 'Some description',
  },
  [Page.funds]: {
    items: funds.testRows,
    __optimistic: funds.testRows.map(() => undefined),
    viewSoldFunds: false,
    cashTarget: 15000,
    period: FundsPeriod.year1,
    cache: {
      [FundsPeriod.year1]: {
        startTime: funds.testStartTime,
        cacheTimes: funds.testCacheTimes,
        prices: funds.testPrices,
      },
    },
  },
  stocks: {
    loading: false,
    indices: [
      {
        code: 'SPX',
        name: 'S&P 500',
        gain: 0,
        up: false,
        down: false,
      },
    ],
    shares: [],
    history: [],
    lastPriceUpdate: null,
  },
  [Page.income]: {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    olderExists: null,
    offset: 0,
    loadingMore: false,
  },
  [Page.bills]: {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    olderExists: null,
    offset: 0,
    loadingMore: false,
  },
  [Page.food]: {
    total: 8755601,
    weekly: 6451,
    olderExists: true,
    offset: 0,
    loadingMore: false,
    items: [
      {
        id: numericHash('id19'),
        date: new Date('2018-04-17'),
        item: 'foo3',
        category: 'bar3',
        cost: 29,
        shop: 'bak3',
      },
      {
        id: numericHash('id300'),
        date: new Date('2018-02-03'),
        item: 'foo1',
        category: 'bar1',
        cost: 1139,
        shop: 'bak2',
      },
      {
        id: numericHash('id29'),
        date: new Date('2018-02-02'),
        item: 'foo3',
        category: 'bar3',
        cost: 498,
        shop: 'bak3',
      },
      {
        id: numericHash('id81'),
        date: new Date('2018-02-03'),
        item: 'foo2',
        category: 'bar2',
        cost: 876,
        shop: 'bak2',
      },
    ],
    __optimistic: [undefined, undefined, undefined, undefined],
  },
  [Page.general]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: null,
    loadingMore: false,
  },
  [Page.holiday]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: false,
    loadingMore: false,
  },
  [Page.social]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: false,
    loadingMore: false,
  },
};
