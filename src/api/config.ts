import path from 'path';
import * as getenv from 'getenv';

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line
  require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../.env.test') : undefined,
  });
}

export default {
  db: {
    url:
      process.env.NODE_ENV === 'test'
        ? getenv.string(
            'DATABASE_URL',
            `postgres://docker:docker@localhost:${getenv.int(
              'DB_PORT_BUDGET_DEV',
              5432,
            )}/budget_test`,
          )
        : getenv.string('DATABASE_URL'),
  },
  redis: {
    host: getenv.string('REDIS_HOST', 'localhost'),
    port: getenv.int('REDIS_PORT', 6379),
    user: getenv.string('REDIS_USERNAME', ''),
    password: getenv.string('REDIS_PASSWORD', ''),
  },
  app: {
    port: getenv.int('PORT', 3000),
  },
  openExchangeRatesApiKey: getenv.string('OPEN_EXCHANGE_RATES_API_KEY', ''),
  scrapeTimeout: getenv.int('SCRAPE_TIMEOUT', 30000),
  user: {
    tokenSecret: getenv.string('USER_TOKEN_SECRET', 'somesupersecret'),
    sessionExpiryDays: getenv.int('SESSION_EXPIRY_DAYS', 30),
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
