const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const __DEV__ = process.env.NODE_ENV === 'development';

function getPlugins() {
  const common = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, './web/src/templates/index.ejs'),
      inject: true,
      filename: path.resolve(__dirname, './web/build/index.html'),
    }),
    new FaviconsWebpackPlugin({
      logo: path.resolve(__dirname, './web/src/images/favicon.png'),
      prefix: 'icons-[hash]/',
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
    filename: 'assets/bundle.[hash].js',
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
        test: /\.(woff2?|ttf|eot|svg|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'assets/[hash].[ext]',
          },
        },
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  plugins: getPlugins(),
};
