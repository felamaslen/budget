const moduleConfig = require('./module.common');

module.exports = {
    ...moduleConfig,
    loaders: moduleConfig.loaders.map(loader => {
        if (loader.test === /\.jsx?$/) {
            return ['react-hot', ...loader.loaders];
        }

        return loader;
    })
};

