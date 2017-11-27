const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const sassLoader = require('./sass-loader');

const webpackConfig = require('./conf.common');

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
    module: {
        ...webpackConfig.module,
        loaders: [
            ...webpackConfig.module.loaders,
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loader: sassLoader()
            }
        ]
    }
};

