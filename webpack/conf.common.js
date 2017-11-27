const plugins = require('./plugin.common');

module.exports = {
    entry: ['babel-polyfill', './web/src/index'],
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    resolveLoader: {
        modules: ['node_modules', __dirname]
    },
    plugins
};

