const path = require('path');
const HTMLWebpackCombineMultipleConfigsPlugin = require('html-webpack-combine-multiple-configs-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const __DEV__ = process.env.NODE_ENV === 'development';

function getAnalyzerMode() {
  if (process.env.ANALYZE_BUNDLE === 'server') {
    return 'server';
  }
  if (process.env.ANALYZE_BUNDLE === 'static' || ['true', '1'].includes(process.env.CI)) {
    return 'static';
  }
  if (__DEV__) {
    return 'disabled';
  }
  return 'json';
}

function getPlugins(suffix) {
  const analyzerMode = getAnalyzerMode();

  const common = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, './web/src/templates/index.ejs'),
      inject: true,
      filename: path.resolve(__dirname, `./web/build/index.html`),
      favicon: path.resolve(__dirname, './web/src/images/favicon.png'),
    }),
    analyzerMode !== 'disabled' &&
      new BundleAnalyzerPlugin({
        analyzerMode,
        generateStatsFile: true,
        reportFilename: `report.${suffix}.html`,
      }),
  ].filter(Boolean);

  if (__DEV__) {
    return [
      ...common,
      new webpack.DefinePlugin({
        'process.env': {
          SKIP_LOG_ACTIONS: JSON.stringify(process.env.SKIP_LOG_ACTIONS || ''),
        },
      }),
      new webpack.HotModuleReplacementPlugin(),
    ];
  }

  return [
    ...common,
    new HTMLWebpackCombineMultipleConfigsPlugin(),
    new ScriptExtHtmlWebpackPlugin({
      module: /\.mjs$/,
      custom: [
        {
          test: /\.js$/,
          attribute: 'nomodule',
          value: '',
        },
      ],
    }),
    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: path.resolve(__dirname, './web/src/service-worker.ts'),
      dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
      exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    }),
  ];
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

const baseConfig = {
  entry: getEntry(),
  devtool: __DEV__ ? 'eval-cheap-module-source-map' : false,
  mode: __DEV__ ? 'development' : 'production',
  output: {
    path: path.join(__dirname, './web/build'),
    publicPath,
    assetModuleFilename: 'assets/[hash][ext][query]',
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
        test: /service-worker\.ts$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: 'css-loader',
      },
      {
        test: /\.(woff2?|ttf|eot|svg|png|jpg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ],
  },
};

const legacyConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'assets/bundle.[name].[chunkhash].es5.js',
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
                  useBuiltIns: 'entry',
                  corejs: '3',
                  targets: {
                    browsers: ['>0.25%', 'not dead'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: getPlugins('es5'),
};

const moduleConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'assets/bundle.[name].[chunkhash].mjs',
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
                  useBuiltIns: 'entry',
                  corejs: '3',
                  targets: {
                    browsers: [
                      'Chrome >= 60',
                      'Safari >= 10.1',
                      'iOS >= 10.3',
                      'Firefox >= 54',
                      'Edge >= 15',
                    ],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: getPlugins('module'),
};

const devConfig = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'assets/bundle.[name].[chunkhash].mjs',
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
            sourceMaps: 'inline',
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  useBuiltIns: 'entry',
                  corejs: '3',
                  targets: {
                    browsers: [
                      'Chrome >= 60',
                      'Safari >= 10.1',
                      'iOS >= 10.3',
                      'Firefox >= 54',
                      'Edge >= 15',
                    ],
                  },
                },
              ],
            ],
            plugins: ['react-hot-loader/babel'],
          },
        },
      },
    ],
  },
  plugins: getPlugins('dev'),
};

module.exports = __DEV__ ? devConfig : [legacyConfig, moduleConfig];
