module.exports = {
    entry: ['babel-polyfill', './web/src/index'],
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    resolveLoader: {
        modules: ['node_modules', __dirname]
    },
    plugins: [],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /favicon\.png/,
                loader: 'file-loader',
                query: {
                    name: 'favicon.ico',
                    publicPath: './'
                }
            },
            {
                test: filename => {
                    if (filename.match(/favicon\.png/)) {
                        return false;
                    }

                    return filename.match(/\.(woff2?|ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/);
                },
                loader: 'file-loader',
                query: {
                    name: 'assets/[hash].[ext]',
                    publicPath: '../'
                }
            },
            {
                test: /\.scss$/,
                enforce: 'pre',
                loaders: 'import-glob-loader'
            }
        ]
    }
};

