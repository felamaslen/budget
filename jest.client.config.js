const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./web/src'],
  moduleNameMapper: {
    '\\.(jpg|png)': '<rootDir>/web/src/test-utils/file-loader.js',
    ...baseConfig.moduleNameMapper,
  },
  testMatch: ['**/*.spec.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/web/src/test-utils/after-env.ts'],
  coverageDirectory: 'coverage/web',
  collectCoverageFrom: [
    'web/src/**/*.{ts,tsx}',
    '!node_modules/**',
    '!web/src/test-data/**',
    '!web/src/test-utils/**',
  ],
  snapshotSerializers: ['@emotion/jest/serializer'],
};
