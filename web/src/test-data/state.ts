import numericHash from 'string-hash';
import * as funds from './funds';

import { State } from '~client/reducers';
import { FundPeriod, NetWorthCategoryType, PageListStandard } from '~client/types';

export const testNow = new Date('2018-03-13T11:23:01Z');

export const testState: State = {
  api: {
    loading: 0,
    error: null,
    appConfig: {
      birthDate: new Date('1990-01-01'),
    },
  },
  error: [],
  overview: {
    startDate: new Date('2018-01-31T23:59:59.999Z'),
    endDate: new Date('2018-07-31T23:59:59.999Z'),
    annualisedFundReturns: 0.143,
    homeEquityOld: [],
    cost: {
      funds: [94004, 105390, 110183, 100779, 101459, 102981, 103293, 0, 0, 0],
      [PageListStandard.Income]: [2000, 1900, 1500, 2500, 2300, 1800, 2600],
      [PageListStandard.Bills]: [1000, 900, 400, 650, 0, 0, 0],
      [PageListStandard.Food]: [50, 13, 20, 19, 0, 0, 0],
      [PageListStandard.General]: [150, 90, 10, 35, 0, 0, 0],
      [PageListStandard.Holiday]: [10, 1000, 95, 13, 0, 0, 0],
      [PageListStandard.Social]: [50, 65, 134, 10, 0, 0, 0],
    },
  },
  netWorth: {
    categories: [
      {
        id: numericHash('real-cash-category-id'),
        type: NetWorthCategoryType.Asset,
        category: 'Cash (easy access)',
        color: '#00ff00',
        isOption: false,
      },
      {
        id: numericHash('real-option-category-id'),
        type: NetWorthCategoryType.Asset,
        category: 'Options',
        color: '#0a9cff',
        isOption: true,
      },
      {
        id: numericHash('real-house-category-id'),
        type: NetWorthCategoryType.Asset,
        category: 'House',
        color: '#00fa00',
        isOption: false,
      },
      {
        id: numericHash('real-mortgage-category-id'),
        type: NetWorthCategoryType.Liability,
        category: 'Mortgage',
        color: '#fa0000',
        isOption: false,
      },
      {
        id: numericHash('real-credit-card-category-id'),
        type: NetWorthCategoryType.Liability,
        category: 'Credit cards',
        color: '#fc0000',
        isOption: false,
      },
    ],
    subcategories: [
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
        isSAYE: false,
        opacity: 0.9,
      },
      {
        id: numericHash('real-option-subcategory-id'),
        categoryId: numericHash('real-option2-category-id'),
        subcategory: 'Other share',
        hasCreditLimit: null,
        isSAYE: false,
        opacity: 0.9,
      },
      {
        id: numericHash('real-saye-subcategory-id'),
        categoryId: numericHash('real-option-category-id'),
        subcategory: 'Some SAYE share',
        hasCreditLimit: null,
        isSAYE: true,
        opacity: 0.9,
      },
      {
        id: numericHash('real-saye2-subcategory-id'),
        categoryId: numericHash('real-option-category-id'),
        subcategory: 'Other SAYE share',
        hasCreditLimit: null,
        isSAYE: true,
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
        categoryId: numericHash('real-house-category-id'),
        subcategory: 'My house',
        hasCreditLimit: null,
        opacity: 0.15,
      },
      {
        id: numericHash('real-mortgage-subcategory-id'),
        categoryId: numericHash('real-mortgage-category-id'),
        subcategory: 'My mortgage',
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
    entries: [
      {
        id: numericHash('real-entry-id-a'),
        date: new Date('2018-02-28'),
        values: [
          {
            subcategory: numericHash('real-wallet-subcategory-id'),
            simple: 10324,
            fx: [{ currency: 'CZK', value: 37.5 }],
          },
          {
            subcategory: numericHash('real-mortgage-subcategory-id'),
            simple: -18744200,
            skip: false,
          },
          {
            subcategory: numericHash('real-bank-subcategory-id'),
            simple: 1296523,
          },
          {
            subcategory: numericHash('real-credit-card-subcategory-id'),
            simple: -8751,
          },
          {
            subcategory: numericHash('real-house-subcategory-id'),
            simple: 21000000,
          },
        ],
        creditLimit: [
          {
            subcategory: numericHash('real-credit-card-subcategory-id'),
            value: 120000,
          },
        ],
        currencies: [{ currency: 'CZK', rate: 0.035 }],
      },
      {
        id: numericHash('real-entry-id-b'),
        date: new Date('2018-03-31'),
        values: [
          {
            subcategory: numericHash('real-wallet-subcategory-id'),
            simple: 9752,
          },
          {
            subcategory: numericHash('real-mortgage-subcategory-id'),
            simple: -18420900,
            skip: false,
          },
          {
            subcategory: numericHash('real-bank-subcategory-id'),
            simple: 1051343,
          },
          {
            subcategory: numericHash('real-credit-card-subcategory-id'),
            simple: -21939,
          },
          {
            subcategory: numericHash('real-option-subcategory-id'),
            option: {
              units: 103,
              vested: 101,
              strikePrice: 77.65,
              marketPrice: 95.57,
            },
          },
          {
            subcategory: numericHash('real-option2-subcategory-id'),
            option: {
              units: 500,
              vested: 104,
              strikePrice: 104.23,
              marketPrice: 93.22,
            },
          },
          {
            subcategory: numericHash('real-house-subcategory-id'),
            simple: 21500000,
          },
          {
            subcategory: numericHash('real-saye-subcategory-id'),
            option: {
              units: 881,
              vested: 698,
              strikePrice: 123.6,
              marketPrice: 182.3,
            },
          },
          {
            subcategory: numericHash('real-saye2-subcategory-id'),
            option: {
              units: 120,
              vested: 94,
              strikePrice: 200.1,
              marketPrice: 182.3,
            },
          },
        ],
        creditLimit: [
          {
            subcategory: numericHash('real-credit-card-subcategory-id'),
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
    oldOptions: [],
  },
  funds: {
    items: funds.testRows,
    __optimistic: funds.testRows.map(() => undefined),
    viewSoldFunds: false,
    cashTarget: 15000,
    historyOptions: {
      period: FundPeriod.Year,
      length: 1,
    },
    startTime: funds.testStartTime,
    cacheTimes: funds.testCacheTimes,
    prices: funds.testPrices,
    todayPrices: {},
  },
  [PageListStandard.Income]: {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    olderExists: null,
    offset: 0,
  },
  [PageListStandard.Bills]: {
    items: [],
    __optimistic: [],
    total: 0,
    weekly: 0,
    olderExists: null,
    offset: 0,
  },
  [PageListStandard.Food]: {
    total: 8755601,
    weekly: 6451,
    olderExists: true,
    offset: 0,
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
  [PageListStandard.General]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: null,
  },
  [PageListStandard.Holiday]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: false,
  },
  [PageListStandard.Social]: {
    items: [],
    __optimistic: [undefined],
    total: 0,
    weekly: 0,
    offset: 0,
    olderExists: false,
  },
};
