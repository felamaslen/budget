/**
 * Returns webpack configuration objects
 */

/* eslint-disable global-require */

if (process.env.NODE_ENV === 'development' || process.env.DOTENV_INJECT === 'true') {
    require('dotenv').config();
}

function webpackConfig() {
    if (process.env.NODE_ENV === 'development') {
        return require('./webpack/conf.dev');
    }

    return require('./webpack/conf.prod');
}

module.exports = () => webpackConfig();

