const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const path = require('path');

require('dotenv').config();

const webpackConfig = require('./conf.common');
const moduleConfigDev = require('./module.dev');

module.exports = {
    ...webpackConfig,
    devtool: 'source-map',
    entry: [
        `webpack-dev-server/client?http://0.0.0.0:${process.env.PORT_WDS}`,
        'webpack/hot/only-dev-server',
        ...webpackConfig.entry
    ],
    plugins: [
        ...webpackConfig.plugins,
        new Dotenv({
            path: path.join(__dirname, '../.env'),
            safe: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: moduleConfigDev,
    devServer: {
        stats: {
            colors: true,
            modules: false,
            chunks: false,
            reasons: true
        },
        hot: true,
        quiet: false,
        noInfo: false,
        publicPath: '/',
        port: process.env.PORT_WDS,
        historyApiFallback: true,
        proxy: {
            '/': {
                target: `http://localhost:${process.env.PORT}`,
                secure: false
            }
        }
    }
};

