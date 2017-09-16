const path = require('path');

const plugins = require('./plugin.common');

module.exports = {
    entry: ['babel-polyfill', './web/src/index'],
    output: {
        path: path.join(__dirname, '../web/build'),
        filename: 'js/bundle.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    resolveLoader: {
        modules: ['node_modules', __dirname]
    },
    plugins
};

