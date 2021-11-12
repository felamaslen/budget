const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./src/client', './src/shared'],
  moduleNameMapper: {
    '\\.(jpg|png)': '<rootDir>/src/client/test-utils/file-loader.js',
    '^file-loader': '<rootDir>/src/client/__mocks__/file-mock.js',
    '^worker-loader': '<rootDir>/src/client/__mocks__/worker-mock.js',
    'react-virtualized-auto-sizer':
      '<rootDir>/src/client/test-utils/react-virtualized-auto-sizer-mock',
    ...baseConfig.moduleNameMapper,
  },
  testMatch: ['**/*.spec.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/client/test-utils/after-env.ts'],
  coverageDirectory: 'coverage/client',
  collectCoverageFrom: [
    'src/client/**/*.{ts,tsx}',
    '!src/client/**/*.spec.{ts,tsx}',
    '!node_modules/**',
    '!src/client/test-data/**',
    '!src/client/test-utils/**',
    '!src/client/__tests__/**',
    '!src/client/gql/**',
  ],
  snapshotSerializers: ['@emotion/jest/serializer'],
};
