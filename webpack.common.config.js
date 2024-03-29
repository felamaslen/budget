const path = require('path');
const LoadablePlugin = require('@loadable/webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

function getAnalyzerMode(__DEV__) {
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

function getPlugins(__DEV__, suffix) {
  const analyzerMode = getAnalyzerMode(__DEV__);

  const common = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        IS_CLIENT: JSON.stringify('true'),
      },
    }),
    new LoadablePlugin({
      filename: `loadable-stats-${suffix}.json`,
      outputAsset: true,
      writeToDisk: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src/client/templates/index.html'),
          to: path.resolve(__dirname, './static'),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    analyzerMode !== 'disabled' &&
      new BundleAnalyzerPlugin({
        analyzerMode,
        generateStatsFile: true,
        reportFilename: `report.${suffix}.html`,
      }),
  ].filter(Boolean);

  if (__DEV__) {
    return [...common, new webpack.HotModuleReplacementPlugin()];
  }

  return [
    ...common,
    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: path.resolve(__dirname, './src/client/service-worker.ts'),
      dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
      exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    }),
  ];
}

function getEntry(__DEV__) {
  const common = ['./src/client/index.tsx'];

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

const babelOptionsProd = {
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
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
};

const babelOptionsDev = {
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
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['react-hot-loader/babel'],
};

const getBaseConfig = (__DEV__) => ({
  entry: getEntry(__DEV__),
  devtool: __DEV__ ? 'eval-source-map' : false,
  mode: __DEV__ ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, './static'),
    publicPath,
    assetModuleFilename: 'assets/[hash][ext][query]',
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
      '~shared': path.resolve(__dirname, './src/shared'),
      '~client': path.resolve(__dirname, './src/client'),
      '~api': path.resolve(__dirname, './src/api'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  optimization: {
    usedExports: true,
    runtimeChunk: true,
  },
  module: {
    rules: [
      {
        test: /service-worker\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOptionsProd,
        },
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
});

module.exports = {
  getPlugins,
  getBaseConfig,
  babelOptionsProd,
  babelOptionsDev,
};
