const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpackConfig = require('./conf.common');
const moduleConfigProd = require('./module.prod');

module.exports = Object.assign({}, webpackConfig, {
    devtool: 'cheap-module-source-map',
    plugins: webpackConfig.plugins.concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                'dead_code': true,
                'drop_debugger': true,
                conditionals: true,
                unused: true,
                'if_return': true
            },
            mangle: {
                toplevel: true
            }
        }),
        new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.css$/,
            cssProcessorOptions: {
                discardComments: { removeAll: true }
            }
        })
    ]),
    module: moduleConfigProd,
    bail: true
});

