const basePresets = [
  '@babel/preset-react',
  '@babel/preset-typescript',
  ['@emotion/babel-preset-css-prop'],
];

module.exports = {
  plugins: [
    'const-enum',
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
        ...basePresets,
      ],
    },
    development: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: true,
            targets: {
              browsers: ['last 2 Chrome versions'],
            },
          },
        ],
        ...basePresets,
      ],
    },
    node: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
        ...basePresets,
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
        ...basePresets,
      ],
      plugins: ['dynamic-import-node'],
    },
  },
};
