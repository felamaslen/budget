import * as getenv from 'getenv';

import { getDbUrl } from './db-url';
import { Page, ListCalcCategory } from './types';

if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
}

export default {
  db: {
    url: getDbUrl(),
  },
  app: {
    port: getenv.int('PORT', 3000),
  },
  openExchangeRatesApiKey: getenv.string('OPEN_EXCHANGE_RATES_API_KEY', ''),
  scrapeTimeout: getenv.int('SCRAPE_TIMEOUT', 30000),
  user: {
    tokenSecret: getenv.string('USER_TOKEN_SECRET', 'somesupersecret'),
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
    listExtendedCategories: [
      Page.food,
      Page.general,
      Page.holiday,
      Page.social,
    ] as ListCalcCategory[],
    currencyUnit: '£',
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
      birthDate: getenv.string('BIRTH_DATE', '1990-01-01'),
    },
    pie: {
      tolerance: getenv.float('PIE_TOLERANCE', 0.075),
      detail: getenv.int('PIE_DETAIL', 30),
    },
  },
};
