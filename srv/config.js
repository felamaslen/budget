/**
 * Configuration variables (mainly environment variables);
 */

module.exports = {
  debug: process.env.DEBUG === 'yes',
  mongoUri: process.env.MONGO_URI,
  webUri: process.env.WEB_URI,
  userHashSalt: process.env.USER_HASH_SALT,
  msg: {
    unknownApiEndpoint: 'Unknown API endpoint',
    errorServerDb: 'Unknown database error',
    errorLoginBad: 'Bad PIN'
  }
};

