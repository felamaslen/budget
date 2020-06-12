module.exports = {
  plugins: ['jsx-a11y', 'prettier', 'react', 'react-hooks', 'import', 'jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 8,
    tokens: true,
    sourceType: 'module',
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/all',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      alias: {
        map: [
          ['~client', './web/src'],
          ['~client-test', './web/test'],
          ['~api', './api/src'],
          ['~api-test', './api/test'],
        ],
        extensions: ['.js', '.tsx', '.ts'],
      },
      typescript: {
        alwaysTryTypes: true,
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
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*spec.ts',
          '**/*.spec.tsx',
          '**/*.spec.js',
          'jest.config.js',
          'jest.api.integration.config.js',
          'jest.api.unit.config.js',
          'jest.client.config.js',
          'web/src/test-utils/**/*.ts',
          'web/src/global.d.ts',
          'web/src/store/configureStore.dev.ts',
          'api/src/test-utils/**/*.ts',
          'api/src/global.d.ts',
          'scripts/**/*.ts',
          'webpack.config.js',
        ],
      },
    ],
    'import/prefer-default-export': 0,
    'jest/lowercase-name': 0,
    'jest/no-hooks': 0,
    'jest/prefer-expect-assertions': 'warn',
    'jest/prefer-strict-equal': 'warn',
    'jest/require-top-level-describe': 0,
    'max-len': ['error', 120],
    'no-bitwise': 0,
    'no-underscore-dangle': 0,
    'prettier/prettier': ['error'],
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.js', '.jsx', '.tsx'],
      },
    ],
    'react/prop-types': 0,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/camelcase': 0,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef-init': 0,
        'prefer-destructuring': 0,
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-var-requires': ['error'],
      },
    },
  ],
};
