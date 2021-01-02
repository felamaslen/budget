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
              browsers: ['last 2 versions', 'ie >= 10'],
            },
          },
        ],
      ],
      plugins: ['babel-plugin-react-remove-properties'],
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
