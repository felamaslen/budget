const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DeadCodePlugin = require('webpack-deadcode-plugin');

const __DEV__ = process.env.NODE_ENV === 'development';

function sassLoader() {
    const common = [
        'css-loader',
        {
            loader: 'postcss-loader',
        },
        'sass-loader',
    ];

    if (__DEV__) {
        return ['style-loader', ...common];
    }

    return [MiniCssExtractPlugin.loader, ...common];
}

function getPlugins() {
    const common = [
        new DeadCodePlugin({
            patterns: ['web/src/**/*.js'],
            exclude: ['web/test/**/*.js'],
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: [autoprefixer()],
            },
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                BIRTH_DATE: JSON.stringify(process.env.BIRTH_DATE || '1990-01-01'),
                STOCK_INDICES: JSON.stringify(process.env.STOCK_INDICES || ''),
                DO_STOCKS_LIST: JSON.stringify(process.env.DO_STOCKS_LIST || 'false'),
                FAKE_STOCK_PRICES: JSON.stringify(process.env.FAKE_STOCK_PRICES || 'false'),
                DEFAULT_FUND_PERIOD: JSON.stringify(process.env.DEFAULT_FUND_PERIOD || 'year1'),
            },
        }),
    ];

    if (__DEV__) {
        return [
            ...common,
            new webpack.DefinePlugin({
                'process.env': {
                    SKIP_LOG_ACTIONS: JSON.stringify(process.env.SKIP_LOG_ACTIONS || ''),
                },
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
        ];
    }

    return [
        ...common,
        new MiniCssExtractPlugin({
            filename: 'assets/style.css',
        }),
    ];
}

function getOptimization() {
    return {
        usedExports: true,
    };
}

function getEntry() {
    const common = ['./web/src/index.js'];

    if (__DEV__) {
        return [
            'webpack/hot/only-dev-server',
            'webpack-hot-middleware/client?reload=true',
            'react-hot-loader/patch',
            ...common,
        ];
    }

    return common;
}

const publicPath = '/';

module.exports = {
    entry: getEntry(),
    devtool: __DEV__ ? 'cheap-module-eval-source-map' : false,
    mode: __DEV__ ? 'development' : 'production',
    output: {
        path: path.join(__dirname, './web/build'),
        publicPath,
        filename: 'assets/bundle.js',
    },
    resolve: {
        alias: {
            'react-dom': '@hot-loader/react-dom',
            '~client': path.resolve(__dirname, './web/src'),
            '~client-test': path.resolve(__dirname, './web/test'),
            '~api': path.resolve(__dirname, './api/src'),
            '~api-test': path.resolve(__dirname, './api/test'),
        },
        extensions: ['.ts', '.tsx', '.js'],
    },
    optimization: getOptimization(),
    module: {
        rules: [
            {
                test: /\.(js|tsx?)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: sassLoader(),
            },
            {
                test: /\.css$/,
                use: 'css-loader',
            },
            {
                test: filename => {
                    if (filename.match(/favicon\.png/)) {
                        return false;
                    }

                    return filename.match(
                        /\.(woff2?|ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    );
                },
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'assets/[hash].[ext]',
                    },
                },
            },
            {
                test: /favicon\.png/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'assets/favicon.ico',
                    },
                },
            },
        ],
    },
    plugins: getPlugins(),
};
