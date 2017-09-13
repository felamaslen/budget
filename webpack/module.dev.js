const moduleConfig = require('./module.common');

moduleConfig.loaders = moduleConfig.loaders.map(loader => {
    if (loader.test === /\.jsx?$/) {
        loader.loaders.unshift('react-hot');
    }

    return loader;
});

module.exports = moduleConfig;

