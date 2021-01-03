module.exports = {
  plugins: ['const-enum', '@emotion'],
  presets: ['@babel/preset-typescript', '@babel/preset-react'],
  env: {
    production: {
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
      plugins: ['babel-plugin-react-remove-properties'],
    },
    node: {
      plugins: ['babel-plugin-webpack-alias-7'],
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
    },
  },
};
