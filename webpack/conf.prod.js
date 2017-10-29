const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const webpackConfig = require('./conf.common');
const moduleConfigProd = require('./module.prod');

module.exports = {
    ...webpackConfig,
    devtool: 'cheap-module-source-map',
    plugins: [
        ...webpackConfig.plugins,
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
                STOCK_INDICES: JSON.stringify(process.env.STOCK_INDICES || ''),
                DO_STOCKS_LIST: JSON.stringify(process.env.DO_STOCKS_LIST || 'false')
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
        }),
        new ExtractTextPlugin('css/style.css', {
            allChunks: true
        })
    ],
    module: moduleConfigProd,
    bail: true
};

