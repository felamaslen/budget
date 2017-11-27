const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

require('dotenv').config();

const webpackConfig = require('./conf.common');
const moduleConfigDev = require('./module.dev');

module.exports = {
    ...webpackConfig,
    devtool: 'cheap-module-source-map',
    entry: [
        'webpack/hot/only-dev-server',
        'webpack-hot-middleware/client',
        'react-hot-loader/patch',
        ...webpackConfig.entry
    ],
    output: {
        publicPath: '/',
        filename: 'js/bundle.js'
    },
    plugins: [
        ...webpackConfig.plugins,
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new Dotenv({ path: '.env' })
    ],
    module: moduleConfigDev
};

