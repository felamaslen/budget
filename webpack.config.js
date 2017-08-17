const path = require('path');

function moduleConfig() {
    return {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader?{"presets":["react","es2015"]}'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url?limit=10000&minetype=application/font-woff'
            },
            {
                test: /\.(ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file'
            },
            {
                test: /\.less$/,
                loader: 'style!css!autoprefixer!less'
            }
        ]
    };
}

function webpackConfigProduction() {
    return {
        devtool: 'cheap-module-source-map',
        entry: [
            './web/src/js/index.jsx'
        ],
        output: {
            path: path.join(__dirname, '../web/build/js'),
            filename: 'main.js'
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        plugins: [
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
            })
        ],
        module: moduleConfig()
    };
}

function webpackConfigDevelopment() {
    return {
        devtool: 'source-map',
        entry: [
            `webpack-dev-server/client?http://0.0.0.0:${process.env.PORT_WDS}`,
            'webpack/hot/only-dev-server',
            './web/src/js/index.jsx'
        ],
        output: {
            path: path.join(__dirname, 'dist'),
            filename: 'js/main.js'
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin()
        ],
        module: moduleConfig()
    };
}

function webpackConfig() {
    if (process.env.NODE_ENV === 'production') {
        return webpackConfigProduction();
    }

    return webpackConfigDevelopment();
}

module.exports = webpackConfig();

