const ExtractTextPlugin = require('extract-text-webpack-plugin');

const moduleConfig = require('./module.common');

module.exports = {
    ...moduleConfig,
    loaders: moduleConfig.loaders.map(loader => {
        if (loader.test.toString() === '/\\.scss$/') {
            return { ...loader, loader: ExtractTextPlugin.extract(loader.loader) };
        }

        return loader;
    })
};

