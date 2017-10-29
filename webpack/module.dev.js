const moduleConfig = require('./module.common');

module.exports = {
    ...moduleConfig,
    loaders: moduleConfig.loaders.map(loader => {
        if (loader.test.toString() === '/\\.scss$/') {
            return { ...loader, loader: `style-loader!${loader.loader}` };
        }

        return loader;
    })
};

