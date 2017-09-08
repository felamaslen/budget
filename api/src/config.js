/**
 * Configuration variables (mainly environment variables);
 */

module.exports = () => {
    return {
        debug: process.env.NODE_ENV !== 'production',
        debugSql: process.env.SQLDEBUGGER === 'true',
        mysqlUri: process.env.MYSQL_URI,
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
            funds: {
                salt: process.env.FUND_SALT || '',
                historyResolution: parseInt(process.env.FUND_RESOLUTION || 100, 10)
            },
            overview: {
                numLast: 25,
                numFuture: 12,
                startYear: 2014,
                startMonth: 9
            }
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
};

