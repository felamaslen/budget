import * as getenv from 'getenv';

import { Page } from './types';

if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
}

const config = {
  db: {
    url:
      process.env.NODE_ENV === 'test'
        ? getenv.string('TEST_DATABASE_URL', 'postgres://docker:docker@localhost:5440/budget_test')
        : getenv.string('DATABASE_URL'),
  },
  app: {
    port: getenv.int('PORT', 3000),
  },
  openExchangeRatesApiKey: getenv.string('OPEN_EXCHANGE_RATES_API_KEY', ''),
  scrapeTimeout: getenv.int('SCRAPE_TIMEOUT', 30000),
  user: {
    tokenSecret: getenv.string('USER_TOKEN_SECRET'),
    banTime: getenv.int('IP_BAN_TIME', 300) * 1000,
    banLimit: getenv.int('IP_BAN_LIMIT', 60) * 1000,
    banTries: getenv.int('IP_BAN_TRIES', 5),
  },
  msg: {
    unknownApiEndpoint: 'Unknown API endpoint',
    errorServerDb: 'Unknown database error',
    errorLoginBad: 'Bad PIN',
    errorIpBanned: 'Banned',
    errorNotAuthorized: 'You need to authenticate to do that',
    errorBadAuthorization: 'Bad authentication token',
  },
  timeZone: 'Europe/London',
  data: {
    listCategories: [
      Page.income,
      Page.bills,
      Page.food,
      Page.general,
      Page.holiday,
      Page.social,
    ] as const,
    currencyUnit: '£',
    columnMapExtra: {
      [Page.income]: {},
      [Page.bills]: {},
      [Page.food]: {
        k: 'category',
        s: 'shop',
      },
      [Page.general]: {
        k: 'category',
        s: 'shop',
      },
      [Page.holiday]: {
        h: 'holiday',
        s: 'shop',
      },
      [Page.social]: {
        y: 'society',
        s: 'shop',
      },
    },
    listPageLimit: 100,
    funds: {
      historyResolution: getenv.int('FUND_RESOLUTION', 100),
      scraper: {
        regex: /^(.*)\s\((accum|inc|share|accum-inc)\.?\)$/i,
        regexGeneric: /^(.*)\s\((.*)\)\s\(stock\)$/i,
        userAgent:
          // eslint-disable-next-line max-len
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      },
      stocksApiKey: getenv.string('STOCKS_API_KEY', ''),
    },
    overview: {
      numLast: 25,
      numFuture: 12,
      startYear: 2014,
      startMonth: 9,
      ignoreExpenseCategories: ['House purchase'],
    },
    pie: {
      tolerance: getenv.float('PIE_TOLERANCE', 0.075),
      detail: getenv.int('PIE_DETAIL', 30),
    },
  },
};

export default config;
