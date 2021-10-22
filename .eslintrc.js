module.exports = {
  plugins: ['@emotion', 'jsx-a11y', 'react', 'react-hooks', 'import', 'jest'],
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
          ['~client', './src/client'],
          ['~api', './src/api'],
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
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        ignoreRestArgs: true,
      },
    ],
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    camelcase: 'off',
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
          'src/**/__mocks__/*.ts',
          'src/client/**/*.ts',
          'src/client/**/*.tsx',
          'src/api/migrate.ts',
          'src/api/pre-index.js',
          'src/api/test-utils/**/*.ts',
          'src/api/test-utils/**/*.js',
          'src/api/global.d.ts',
          'src/api/**/__tests__/*',
          'scripts/**/*.ts',
          'types/**/*.ts',
          'webpack.*config.js',
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-webpack-loader-syntax': 'off',
    'jest/lowercase-name': 'off',
    'jest/no-expect-resolves': 'off',
    'jest/no-hooks': 'off',
    'jest/prefer-expect-assertions': 'warn',
    'jest/prefer-strict-equal': 'warn',
    'jest/require-top-level-describe': 'off',
    'jest/valid-title': [
      'error',
      {
        ignoreTypeOfDescribeName: true,
      },
    ],
    'max-len': ['error', 120],
    'no-bitwise': 'off',
    'no-underscore-dangle': 'off',
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-warning-comments': 'warn',
    'react/jsx-filename-extension': [
      2,
      {
        extensions: ['.js', '.jsx', '.tsx'],
      },
    ],
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef-init': 'off',
        'prefer-destructuring': 'off',
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-var-requires': ['error'],
      },
    },
  ],
};
