import { PgConnectionConfig } from 'knex';
import { fundSalt } from './fund-salt.json';
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
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config(); // eslint-disable-line global-require
}

function parseConnectionURI(uri = ''): PgConnectionConfig {
  const matches = uri.match(
    /^postgres(ql)?:\/\/(\w+):(\w+)@([\w-]+(\.[\w-]+)*)(:([0-9]+))?\/(\w+)$/,
  );

  if (!matches) {
    throw new Error('invalid database string');
  }

  const [, , user, password, host, , , port, database] = matches;

  return {
    user,
    password,
    host,
    port: Number(port) || 5432,
    database,
  };
}

export type Config = {
  db: {
    client: string;
    connection: PgConnectionConfig;
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
    listPageLimits: {
      [k in ListCalcCategory]: number;
    };
    funds: {
      salt: string;
      historyResolution: number;
      scraper: {
        regex: RegExp;
        userAgent: string;
      };
      stocksApiKey: string;
    };
    overview: {
      numLast: number;
      numFuture: number;
      startYear: number;
      startMonth: number;
    };
    pie: {
      tolerance: number;
      detail: number;
    };
  };
};

const databaseUrl =
  process.env.NODE_ENV === 'test'
    ? process.env.DATABASE_URL || 'postgres://docker:docker@localhost:5440/budget_test'
    : process.env.DATABASE_URL;

const config: Config = {
  db: {
    client: 'pg',
    connection: parseConnectionURI(databaseUrl),
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
    listPageLimits: {
      [Page.income]: 12,
      [Page.bills]: 6,
      [Page.food]: 2,
      [Page.general]: 4,
      [Page.holiday]: 12,
      [Page.social]: 6,
    },
    funds: {
      salt: fundSalt,
      historyResolution: Math.round(Number(process.env.FUND_RESOLUTION) || 100),
      scraper: {
        regex: /^(.*)\s\((accum|inc|share|accum-inc)\.?\)$/i,
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
    },
    pie: {
      tolerance: Number(process.env.PIE_TOLERANCE) || 0.075,
      detail: Number(process.env.PIE_DETAIL) || 30,
    },
  },
};

export default config;
