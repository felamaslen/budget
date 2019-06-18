/**
 * Configuration variables (mainly environment variables);
 */

if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
    require('dotenv').config(); // eslint-disable-line global-require
}

module.exports = () => ({
    test: process.env.NODE_ENV === 'test',
    testIntegration: process.env.NODE_ENV === 'testintegration',
    debug: process.env.NODE_ENV !== 'production',
    debugSql: process.env.SQLDEBUGGER === 'true',
    postgresUri: process.env.POSTGRES_URI,
    webUrl: process.env.WEB_URL || '',
    openExchangeRatesApiKey: process.env.OPEN_EXCHANGE_RATES_API_KEY || '',
    user: {
        hashSalt: process.env.USER_HASH_SALT || '',
        banTime: (Number(process.env.IP_BAN_TIME) || 300) * 1000,
        banLimit: (Number(process.env.IP_BAN_LIMIT) || 60) * 1000,
        banTries: Math.round(Number(process.env.IP_BAN_TRIES) || 5)
    },
    msg: {
        unknownApiEndpoint: 'Unknown API endpoint',
        errorServerDb: 'Unknown database error',
        errorLoginBad: 'Bad PIN',
        errorIpBanned: 'Banned',
        errorNotAuthorized: 'You need to authenticate to do that',
        errorBadAuthorization: 'Bad authentication token'
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
                shop: 's'
            },
            general: {
                category: 'k',
                shop: 's'
            },
            social: {
                society: 'y',
                shop: 's'
            },
            holiday: {
                holiday: 'h',
                shop: 's'
            }
        },
        listPageLimits: {
            income: 12,
            bills: 6,
            food: 2,
            general: 4,
            social: 6,
            holiday: 12
        },
        funds: {
            salt: 'a963anx2',
            historyResolution: Math.round(Number(process.env.FUND_RESOLUTION) || 100),
            scraper: {
                regex: /^(.*)\s\((accum|inc|share|accum-inc)\.?\)$/i,
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
            },
            stocksApiKey: process.env.STOCKS_API_KEY || ''
        },
        overview: {
            numLast: 25,
            numFuture: 12,
            startYear: 2014,
            startMonth: 9
        },
        pie: {
            tolerance: Number(process.env.PIE_TOLERANCE) || 0.075,
            detail: Number(process.env.PIE_DETAIL) || 30
        }
    }
});

