/**
 * Returns webpack configuration objects
 */

/* eslint-disable global-require */

function webpackConfig() {
    if (process.env.NODE_ENV === 'development') {
        return require('./webpack/conf.dev');
    }

    return require('./webpack/conf.prod');
}

module.exports = webpackConfig();

