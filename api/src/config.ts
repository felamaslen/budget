import {
  ListCalcCategory,
  Page,
  ColumnMap,
  ListCalcItem,
  Income,
  Bill,
  Food,
  General,
  Holiday,
  Social,
} from './types';

if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
}

export type Config = {
  db: {
    url: string;
  };
  app: {
    port: number;
  };
  webUrl: string;
  openExchangeRatesApiKey: string;
  scrapeTimeout: number;
  user: {
    tokenSecret: string;
    banTime: number;
    banLimit: number;
    banTries: number;
  };
  msg: {
    unknownApiEndpoint: string;
    errorServerDb: string;
    errorLoginBad: string;
    errorIpBanned: string;
    errorNotAuthorized: string;
    errorBadAuthorization: string;
  };
  timeZone: string;
  data: {
    listCategories: ListCalcCategory[];
    currencyUnit: string;
    columnMapExtra: {
      income: ColumnMap<Omit<Income, keyof ListCalcItem>>;
      bills: ColumnMap<Omit<Bill, keyof ListCalcItem>>;
      food: ColumnMap<Omit<Food, keyof ListCalcItem>>;
      general: ColumnMap<Omit<General, keyof ListCalcItem>>;
      holiday: ColumnMap<Omit<Holiday, keyof ListCalcItem>>;
      social: ColumnMap<Omit<Social, keyof ListCalcItem>>;
    };
    listPageLimit: number;
    funds: {
      historyResolution: number;
      scraper: {
        regex: RegExp;
        regexGeneric: RegExp;
        userAgent: string;
      };
      stocksApiKey: string;
    };
    overview: {
      numLast: number;
      numFuture: number;
      startYear: number;
      startMonth: number;
      ignoreExpenseCategories: string[];
    };
    pie: {
      tolerance: number;
      detail: number;
    };
  };
};

const databaseUrl =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL || 'postgres://docker:docker@localhost:5440/budget_test'
    : process.env.DATABASE_URL;

const config: Config = {
  db: {
    url: databaseUrl ?? '',
  },
  app: {
    port: Number(process.env.PORT) || 3000,
  },
  webUrl: process.env.WEB_URL || '',
  openExchangeRatesApiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY || '',
  scrapeTimeout: Number(process.env.SCRAPE_TIMEOUT) || 30000,
  user: {
    tokenSecret: process.env.USER_TOKEN_SECRET || 'mysupersecret',
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
    listCategories: [Page.income, Page.bills, Page.food, Page.general, Page.holiday, Page.social],
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
      historyResolution: Math.round(Number(process.env.FUND_RESOLUTION) || 100),
      scraper: {
        regex: /^(.*)\s\((accum|inc|share|accum-inc)\.?\)$/i,
        regexGeneric: /^(.*)\s\((.*)\)\s\(stock\)$/i,
        userAgent:
          // eslint-disable-next-line max-len
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36',
      },
      stocksApiKey: process.env.STOCKS_API_KEY || '',
    },
    overview: {
      numLast: 25,
      numFuture: 12,
      startYear: 2014,
      startMonth: 9,
      ignoreExpenseCategories: ['House purchase'],
    },
    pie: {
      tolerance: Number(process.env.PIE_TOLERANCE) || 0.075,
      detail: Number(process.env.PIE_DETAIL) || 30,
    },
  },
};

export default config;
