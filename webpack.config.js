const path = require('path');
const webpack = require('webpack');

const __DEV__ = process.env.NODE_ENV === 'development';

function getPlugins() {
  const common = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        STOCK_INDICES: JSON.stringify(process.env.STOCK_INDICES || ''),
        DO_STOCKS_LIST: JSON.stringify(process.env.DO_STOCKS_LIST || 'false'),
        FAKE_STOCK_PRICES: JSON.stringify(process.env.FAKE_STOCK_PRICES || 'false'),
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

  return common;
}

function getEntry() {
  const common = ['./web/src/index.tsx'];

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
      '~api': path.resolve(__dirname, './api/src'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  optimization: {
    usedExports: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|tsx?)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: (filename) => {
          if (filename.match(/favicon\.png/)) {
            return false;
          }

          return filename.match(/\.(woff2?|ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/);
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
