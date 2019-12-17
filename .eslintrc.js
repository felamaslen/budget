module.exports = {
  plugins: ['prettier', 'react', 'react-hooks', 'jest', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 8,
    tokens: true,
    sourceType: 'module',
  },
  env: {
    browser: true,
    commonjs: true,
    'jest/globals': true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/all',
    'plugin:react/recommended',
  ],
  settings: {
    'import/resolver': {
      alias: {
        map: [['~', './src']],
        extensions: ['.ts', '.tsx', '.js'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        ignoreRestArgs: true,
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    'import/prefer-default-export': 0,
    'jest/lowercase-name': 0,
    'jest/require-top-level-describe': 0,
    'max-len': ['error', 120],
    'no-bitwise': 0,
    'no-underscore-dangle': 0,
    'prettier/prettier': ['error'],
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/prop-types': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'prefer-destructuring': 0,
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-var-requires': ['error'],
      },
    },
  ],
};
