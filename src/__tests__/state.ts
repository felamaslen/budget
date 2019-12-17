// import { testRows, testPrices, testStartTime, testCacheTimes } from '~/__tests__/funds';
import { testFunds, testStartTime, testCacheTimes, testPrices } from '~/__tests__/funds';
import { GlobalState } from '~/reducers';

const testState: GlobalState = {
  now: new Date('2018-03-23T11:45:20Z'),
  login: {
    loading: false,
  },
  overview: {
    startDate: new Date('2017-09-30Z'),
    viewStartDate: new Date('2018-01-31Z'),
    futureMonths: 3,
    netWorth: [193, 9913, -2123, 10312, 89137, 93128, 10913],
    funds: [
      { value: 94004, cost: 100000 }, // sep-17
      { value: 105390, cost: 99000 }, // oct-17
      { value: 110183, cost: 100000 }, // nov-17
      { value: 100779, cost: 100000 }, // dec-17
      { value: 101459, cost: 110000 }, // jan-18
      { value: 102981, cost: 110000 + 56123 }, // feb
      { value: 103293, cost: 110000 + 56123 - 2382 }, // mar
    ],
    income: [2000, 1900, 1500, 2500, 2300, 1800],
    bills: [1000, 900, 400, 1300, 2700],
    food: [50, 13, 20],
    general: [150, 90, 10],
    holiday: [10, 1000, 95],
    social: [50, 65, 134],
  },
  netWorth: {
    categories: {
      items: [
        {
          id: 'real-cash-category-id',
          type: 'asset',
          category: 'Cash (easy access)',
          color: '#00ff00',
        },
        {
          id: 'real-mortgage-category-id',
          type: 'liability',
          category: 'Cash (other)',
          color: '#fa0000',
        },
        {
          id: 'real-credit-card-category-id',
          type: 'liability',
          category: 'Stocks',
          color: '#fc0000',
        },
      ],
    },
    subcategories: {
      items: [
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
    },
    entries: {
      items: [
        {
          id: 'real-entry-id-a',
          date: new Date('2018-01-31'),
          values: [
            {
              subcategory: 'real-wallet-subcategory-id',
              value: [10324, { currency: 'CZK', value: 37.5 }],
              skip: false,
            },
            {
              subcategory: 'real-house-subcategory-id',
              value: -18744200,
              skip: true,
            },
            {
              subcategory: 'real-bank-subcategory-id',
              value: 1296523,
              skip: false,
            },
            {
              subcategory: 'real-credit-card-subcategory-id',
              value: -8751,
              skip: false,
            },
          ],
          creditLimit: [
            {
              subcategory: 'real-credit-card-subcategory-id',
              limit: 120000,
            },
          ],
          currencies: [{ currency: 'CZK', rate: 0.035 }],
        },
        {
          id: 'real-entry-id-b',
          date: new Date('2018-02-28'),
          values: [
            {
              subcategory: 'real-wallet-subcategory-id',
              value: [9752],
              skip: false,
            },
            {
              subcategory: 'real-house-subcategory-id',
              value: -18420900,
              skip: true,
            },
            {
              subcategory: 'real-bank-subcategory-id',
              value: 1051343,
              skip: false,
            },
            {
              subcategory: 'real-credit-card-subcategory-id',
              value: -21939,
              skip: false,
            },
          ],
          creditLimit: [
            {
              subcategory: 'real-credit-card-subcategory-id',
              limit: 150000,
            },
          ],
          currencies: [
            { currency: 'USD', rate: 0.865 },
            { currency: 'CZK', rate: 0.0314 },
          ],
        },
      ],
    },
  },
  funds: {
    items: testFunds,
    viewSoldFunds: false,
    period: ['year', 1],
    cache: {
      year1: {
        startTime: testStartTime,
        cacheTimes: testCacheTimes,
        prices: testPrices,
      },
    },
  },
};

// app: {
//   windowWidth: 1000,
// },
// login: {
//   loading: false,
//   initialised: true,
//   error: null,
//   uid: 'some-user-id',
//   name: 'Some user',
// },
// api: {
//   loading: false,
//   error: null,
//   key: 'some api key',
// },
// error: [],
// analysis: {
//   period: 'year',
//   grouping: 'category',
//   page: 0,
//   timeline: [[1, 2, 3]],
//   treeVisible: {},
//   cost: [
//     [
//       'foo2',
//       [
//         ['foo2_bar2', 137650],
//         ['foo2_bar1', 156842],
//       ],
//     ],
//     ['foo1', [['foo1_bar1', 1642283]]],
//   ],
//   deep: null,
//   deepBlock: null,
//   saved: 67123,
// },
// stocks: {
//   loading: false,
//   indices: [
//     {
//       code: 'SPX',
//       name: 'S&P 500',
//       gain: 0,
//       up: false,
//       down: false,
//     },
//   ],
//   shares: [],
//   history: [],
//   lastPriceUpdate: null,
// },
// income: {
//   items: [],
// },
// bills: {
//   items: [],
// },
// food: {
//   total: 8755601,
//   items: [
//     {
//       id: 'id19',
//       date: new Date('2018-04-17'),
//       item: 'foo3',
//       category: 'bar3',
//       cost: 29,
//       shop: 'bak3',
//     },
//     {
//       id: 'id300',
//       date: new Date('2018-02-03'),
//       item: 'foo1',
//       category: 'bar1',
//       cost: 1139,
//       shop: 'bak2',
//     },
//     {
//       id: 'id29',
//       date: new Date('2018-02-02'),
//       item: 'foo3',
//       category: 'bar3',
//       cost: 498,
//       shop: 'bak3',
//     },
//     {
//       id: 'id81',
//       date: new Date('2018-02-03'),
//       item: 'foo2',
//       category: 'bar2',
//       cost: 876,
//       shop: 'bak2',
//     },
//   ],
// },
// general: {
//   items: [],
// },
// holiday: {
//   items: [],
// },
// social: {
//   items: [],
// },
// suggestions: {
//   loading: false,
//   list: [],
//   next: [],
// },

export default testState;
