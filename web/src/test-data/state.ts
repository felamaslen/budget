import { Page } from '~client/types/app';
import { State } from '~client/reducers';
import { Period as FundsPeriod } from '~client/constants/graph';
import { Period as AnalysisPeriod, Grouping as AnalysisGrouping } from '~client/constants/analysis';
import * as funds from './funds';

export const testState: State = {
  now: new Date('2018-03-23T11:45:20Z'),
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
    cost: {
      [Page.funds]: [94004, 105390, 110183, 100779, 101459, 102981, 103293, 0, 0, 0],
      fundChanges: [],
      old: [],
      [Page.income]: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
      [Page.bills]: [1000, 900, 400, 650, 0, 0, 0],
      [Page.food]: [50, 13, 20, 19, 0, 0, 0],
      [Page.general]: [150, 90, 10, 35, 0, 0, 0],
      [Page.holiday]: [10, 1000, 95, 13, 0, 0, 0],
      [Page.social]: [50, 65, 134, 10, 0, 0, 0],
    },
  },
  netWorth: {
    categories: [
      {
        id: 'real-cash-category-id',
        type: 'asset',
        category: 'Cash (easy access)',
        color: '#00ff00',
        isOption: false,
      },
      {
        id: 'real-mortgage-category-id',
        type: 'liability',
        category: 'Mortgage',
        color: '#fa0000',
        isOption: false,
      },
      {
        id: 'real-credit-card-category-id',
        type: 'liability',
        category: 'Credit cards',
        color: '#fc0000',
        isOption: false,
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
        date: new Date('2018-02-28'),
        values: [
          {
            id: 'value-id-a1',
            subcategory: 'real-wallet-subcategory-id',
            value: [10324, { currency: 'CZK', value: 37.5 }],
          },
          {
            id: 'value-id-a2',
            subcategory: 'real-house-subcategory-id',
            value: -18744200,
            skip: true,
          },
          {
            id: 'value-id-a3',
            subcategory: 'real-bank-subcategory-id',
            value: 1296523,
          },
          {
            id: 'value-id-a4',
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
        currencies: [{ id: 'currency-id-a1', currency: 'CZK', rate: 0.035 }],
      },
      {
        id: 'real-entry-id-b',
        date: new Date('2018-03-31'),
        values: [
          {
            id: 'value-id-b1',
            subcategory: 'real-wallet-subcategory-id',
            value: [9752],
          },
          {
            id: 'value-id-b2',
            subcategory: 'real-house-subcategory-id',
            value: -18420900,
            skip: true,
          },
          {
            id: 'value-id-b3',
            subcategory: 'real-bank-subcategory-id',
            value: 1051343,
          },
          {
            id: 'value-id-b4',
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
          { id: 'currency-id-b1', currency: 'USD', rate: 0.865 },
          { id: 'currency-id-b2', currency: 'CZK', rate: 0.0314 },
        ],
      },
    ],
    old: [],
  },
  analysis: {
    period: AnalysisPeriod.year,
    grouping: AnalysisGrouping.category,
    loading: false,
    loadingDeep: false,
    page: 0,
    timeline: [[1, 2, 3]],
    treeVisible: {},
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
    viewSoldFunds: false,
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
    total: 0,
    olderExists: null,
  },
  [Page.bills]: {
    items: [],
    total: 0,
    olderExists: null,
  },
  [Page.food]: {
    total: 8755601,
    olderExists: true,
    items: [
      {
        id: 'id19',
        date: new Date('2018-04-17'),
        item: 'foo3',
        category: 'bar3',
        cost: 29,
        shop: 'bak3',
      },
      {
        id: 'id300',
        date: new Date('2018-02-03'),
        item: 'foo1',
        category: 'bar1',
        cost: 1139,
        shop: 'bak2',
      },
      {
        id: 'id29',
        date: new Date('2018-02-02'),
        item: 'foo3',
        category: 'bar3',
        cost: 498,
        shop: 'bak3',
      },
      {
        id: 'id81',
        date: new Date('2018-02-03'),
        item: 'foo2',
        category: 'bar2',
        cost: 876,
        shop: 'bak2',
      },
    ],
  },
  [Page.general]: {
    items: [],
    total: 0,
    olderExists: null,
  },
  [Page.holiday]: {
    items: [],
    total: 0,
    olderExists: false,
  },
  [Page.social]: {
    items: [],
    total: 0,
    olderExists: false,
  },
  suggestions: {
    loading: false,
    list: [],
    next: [],
  },
};

export default testState;
