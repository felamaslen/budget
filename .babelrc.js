const pkg = require('./package.json');

module.exports = {
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: pkg._moduleAliases,
      },
    ],
  ],
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  env: {
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: ['last 2 versions', 'ie >= 10'],
            },
          },
        ],
      ],
    },
    development: {
      sourceMaps: 'inline',
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
          },
        ],
      ],
      plugins: ['react-hot-loader/babel'],
    },
    node: {
      presets: [
        '@babel/preset-typescript',
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: [
        [
          'file-loader',
          {
            name: 'assets/[hash].[ext]',
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
            publicPath: '/',
            outputPath: '/public',
            context: '',
            limit: 0,
          },
        ],
      ],
    },
  },
};
