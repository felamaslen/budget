import pkg from '../../package.json';

export default {
  version: pkg.version,
  test: process.env.NODE_ENV === 'test',
  testIntegration: process.env.NODE_ENV === 'testintegration',
  prod: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV !== 'production',
  debugSql: process.env.ROARR_LOG === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL,
  port: Number(process.env.PORT) || 3000,
  webUrl: process.env.WEB_URL || '',
  openExchangeRatesApiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY || '',
  user: {
    banTime: (Number(process.env.IP_BAN_TIME) || 300) * 1000,
    banLimit: (Number(process.env.IP_BAN_LIMIT) || 60) * 1000,
    banTries: Math.round(Number(process.env.IP_BAN_TRIES) || 5),
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
    listCategories: ['funds', 'income', 'bills', 'food', 'general', 'holiday', 'social'],
    currencyUnit: '£',
    columnMapExtra: {
      income: {},
      bills: {},
      food: {
        category: 'k',
        shop: 's',
      },
      general: {
        category: 'k',
        shop: 's',
      },
      social: {
        society: 'y',
        shop: 's',
      },
      holiday: {
        holiday: 'h',
        shop: 's',
      },
    },
    listPageLimits: {
      income: 12,
      bills: 6,
      food: 2,
      general: 4,
      social: 6,
      holiday: 12,
    },
    funds: {
      salt: 'a963anx2',
      historyResolution: Math.round(Number(process.env.FUND_RESOLUTION) || 100),
      scraper: {
        regex: /^(.*)\s\((accum|inc|share|accum-inc)\.?\)$/i,
        // eslint-disable-next-line max-len
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      },
      stocksApiKey: process.env.STOCKS_API_KEY || '',
    },
    overview: {
      numLast: 25,
      numFuture: 12,
      startYear: 2014,
      startMonth: 9,
    },
    pie: {
      tolerance: Number(process.env.PIE_TOLERANCE) || 0.075,
      detail: Number(process.env.PIE_DETAIL) || 30,
    },
  },
};
