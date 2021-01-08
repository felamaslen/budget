const { getBaseConfig, getPlugins, babelOptionsProd, babelOptionsDev } = require('./webpack.common.config');

const __DEV__ = process.env.NODE_ENV === 'development';
const baseConfig = getBaseConfig(__DEV__);

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
  plugins: getPlugins(false, 'es5'),
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
          options: babelOptionsProd,
        },
      },
    ],
  },
  plugins: getPlugins(false, 'module'),
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
          options: babelOptionsDev,
        },
      },
    ],
  },
  plugins: getPlugins(true, 'dev'),
};

module.exports = __DEV__ ? devConfig : [legacyConfig, moduleConfig];
