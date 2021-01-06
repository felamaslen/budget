const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const { getBaseConfig } = require('./webpack.common.config');

const __DEV__ = process.env.NODE_ENV === 'development';
const baseConfig = getBaseConfig(__DEV__);

module.exports = {
  ...baseConfig,
  entry: './web/src/components/root/index.tsx',
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  output: {
    ...baseConfig.output,
    path: path.resolve(__dirname, './api/build/ssr'),
    filename: 'bundle.js',
    library: '[name]',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      '~client': path.resolve(__dirname, './web/src'),
      '~api': path.resolve(__dirname, './api/src'),
    },
  },
  optimization: {
    ...baseConfig.optimization,
    runtimeChunk: false,
  },
  module: {
    ...baseConfig.module,
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.(js|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  targets: {
                    node: 'current',
                  },
                },
              ],
            ],
            plugins: ['dynamic-import-node', 'remove-webpack'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        IS_CLIENT: JSON.stringify('false'),
      },
    }),
  ],
};
