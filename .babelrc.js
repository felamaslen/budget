module.exports = {
  plugins: [
    'const-enum',
    ['@emotion', { sourceMap: false }],
    '@loadable/babel-plugin',
    [
      'module-resolver',
      {
        alias: {
          '~api': './src/api',
          '~client': './src/client',
          '~shared': './src/shared',
        },
      },
    ],
  ],
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  env: {
    production: {
      plugins: ['babel-plugin-react-remove-properties'],
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: ['>0.25%', 'not dead'],
            },
          },
        ],
      ],
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
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
      plugins: ['dynamic-import-node'],
    },
  },
};
