/**
 * Configuration variables (mainly environment variables);
 */

module.exports = () => {
    return {
        test: process.env.NODE_ENV === 'test',
        debug: process.env.NODE_ENV !== 'production',
        debugSql: process.env.SQLDEBUGGER === 'true',
        mysqlUri: process.env.NODE_ENV === 'test'
            ? process.env.MYSQL_URI_TEST
            : process.env.MYSQL_URI,
        webUrl: process.env.WEB_URL,
        user: {
            hashSalt: process.env.USER_HASH_SALT,
            banTime: parseFloat(process.env.IP_BAN_TIME || 300, 10) * 1000,
            banLimit: parseFloat(process.env.IP_BAN_LIMIT || 60, 10) * 1000,
            banTries: parseInt(process.env.IP_BAN_TRIES || 5, 10)
        },
        msg: {
            unknownApiEndpoint: 'Unknown API endpoint',
            errorServerDb: 'Unknown database error',
            errorLoginBad: 'Bad PIN',
            errorIpBanned: 'Banned',
            errorNotAuthorized: 'You need to authenticate to do that',
            errorBadAuthorization: 'Bad authentication token'
        },
        data: {
            listCategories: ['funds', 'income', 'bills', 'food', 'general', 'holiday', 'social'],
            currencyUnit: '£',
            funds: {
                salt: process.env.FUND_SALT || '',
                historyResolution: parseInt(process.env.FUND_RESOLUTION || 100, 10),
                scraper: {
                    regex: /^(.*)\s\((accum|inc|share)\.?\)$/i,
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
                tolerance: parseFloat(process.env.PIE_TOLERANCE || 0.075, 10),
                detail: parseInt(process.env.PIE_DETAIL || 30, 10)
            }
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
};
