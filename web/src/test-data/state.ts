import { DateTime } from 'luxon';

import { State } from '~client/reducers';
import { Period } from '~client/constants/graph';
import * as funds from './funds';

export const testState: State = {
  now: DateTime.fromISO('2018-03-23T11:45:20Z'),
  app: {
    windowWidth: 1000,
  },
  login: {
    loading: false,
    initialised: true,
    error: null,
    uid: 'some-user-id',
    name: 'Some user',
  },
  api: {
    loading: false,
    error: null,
    key: 'some api key',
  },
  error: [],
  overview: {
    startDate: DateTime.fromISO('2018-01-31T23:59:59.999Z'),
    endDate: DateTime.fromISO('2018-07-31T23:59:59.999Z'),
    cost: {
      funds: [94004, 105390, 110183, 100779, 101459, 102981, 103293, 0, 0, 0],
      income: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
      bills: [1000, 900, 400, 650, 0, 0, 0],
      food: [50, 13, 20, 19, 0, 0, 0],
      general: [150, 90, 10, 35, 0, 0, 0],
      holiday: [10, 1000, 95, 13, 0, 0, 0],
      social: [50, 65, 134, 10, 0, 0, 0],
    },
  },
  netWorth: {
    categories: [
      {
        id: 'real-cash-category-id',
        type: 'asset',
        category: 'Cash (easy access)',
        color: '#00ff00',
      },
      {
        id: 'real-mortgage-category-id',
        type: 'liability',
        category: 'Mortgage',
        color: '#fa0000',
      },
      {
        id: 'real-credit-card-category-id',
        type: 'liability',
        category: 'Credit cards',
        color: '#fc0000',
      },
    ],
    subcategories: [
      {
        id: 'real-wallet-subcategory-id',
        categoryId: 'real-cash-category-id',
        subcategory: 'My wallet',
        hasCreditLimit: null,
        opacity: 0.2,
      },
      {
        id: 'real-bank-subcategory-id',
        categoryId: 'real-cash-category-id',
        subcategory: 'My bank',
        hasCreditLimit: null,
        opacity: 0.25,
      },
      {
        id: 'real-house-subcategory-id',
        categoryId: 'real-mortgage-category-id',
        subcategory: 'My house',
        hasCreditLimit: false,
        opacity: 0.1,
      },
      {
        id: 'real-credit-card-subcategory-id',
        categoryId: 'real-credit-card-category-id',
        subcategory: 'My credit card',
        hasCreditLimit: true,
        opacity: 0.3,
      },
    ],
    entries: [
      {
        id: 'real-entry-id-a',
        date: DateTime.fromISO('2018-02-28'),
        values: [
          {
            subcategory: 'real-wallet-subcategory-id',
            value: [10324, { currency: 'CZK', value: 37.5 }],
          },
          {
            subcategory: 'real-house-subcategory-id',
            value: -18744200,
            skip: true,
          },
          {
            subcategory: 'real-bank-subcategory-id',
            value: 1296523,
          },
          {
            subcategory: 'real-credit-card-subcategory-id',
            value: -8751,
          },
        ],
        creditLimit: [
          {
            subcategory: 'real-credit-card-subcategory-id',
            value: 120000,
          },
        ],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
      {
        id: 'real-entry-id-b',
        date: DateTime.fromISO('2018-03-31'),
        values: [
          {
            subcategory: 'real-wallet-subcategory-id',
            value: [9752],
          },
          {
            subcategory: 'real-house-subcategory-id',
            value: -18420900,
            skip: true,
          },
          {
            subcategory: 'real-bank-subcategory-id',
            value: 1051343,
          },
          {
            subcategory: 'real-credit-card-subcategory-id',
            value: -21939,
          },
        ],
        creditLimit: [
          {
            subcategory: 'real-credit-card-subcategory-id',
            value: 150000,
          },
        ],
        currencies: [
          { currency: 'USD', rate: 0.865 },
          { currency: 'CZK', rate: 0.0314 },
        ],
      },
    ],
    old: [],
  },
  analysis: {
    period: 'year',
    grouping: 'category',
    page: 0,
    timeline: [[1, 2, 3]],
    treeVisible: {},
    cost: [
      [
        'foo2',
        [
          ['foo2_bar2', 137650],
          ['foo2_bar1', 156842],
        ],
      ],
      ['foo1', [['foo1_bar1', 1642283]]],
    ],
    deep: null,
    deepBlock: null,
    saved: 67123,
  },
  funds: {
    items: funds.testRows,
    viewSoldFunds: false,
    period: Period.year1,
    cache: {
      [Period.year1]: {
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
        weight: 0,
      },
    ],
    shares: [],
    history: [],
    lastPriceUpdate: null,
  },
  income: {
    items: [],
  },
  bills: {
    items: [],
  },
  food: {
    total: 8755601,
    items: [
      {
        id: 'id19',
        date: DateTime.fromISO('2018-04-17'),
        item: 'foo3',
        category: 'bar3',
        cost: 29,
        shop: 'bak3',
      },
      {
        id: 'id300',
        date: DateTime.fromISO('2018-02-03'),
        item: 'foo1',
        category: 'bar1',
        cost: 1139,
        shop: 'bak2',
      },
      {
        id: 'id29',
        date: DateTime.fromISO('2018-02-02'),
        item: 'foo3',
        category: 'bar3',
        cost: 498,
        shop: 'bak3',
      },
      {
        id: 'id81',
        date: DateTime.fromISO('2018-02-03'),
        item: 'foo2',
        category: 'bar2',
        cost: 876,
        shop: 'bak2',
      },
    ],
  },
  general: {
    items: [],
  },
  holiday: {
    items: [],
  },
  social: {
    items: [],
  },
  suggestions: {
    loading: false,
    list: [],
    next: [],
  },
};

export default testState;
