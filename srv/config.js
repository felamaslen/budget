/**
 * Configuration variables (mainly environment variables);
 */

require('dotenv').config();

module.exports = () => {
    return {
        debug: process.env.NODE_ENV !== 'production',
        mongoUri: process.env.MONGO_URI,
        webUri: process.env.WEB_URI,
        userHashSalt: process.env.USER_HASH_SALT,
        msg: {
            unknownApiEndpoint: 'Unknown API endpoint',
            errorServerDb: 'Unknown database error',
            errorLoginBad: 'Bad PIN',
            errorIpBanned: 'Banned',
            errorNotAuthorized: 'You need to authenticate to do that'
        }
    };
};

