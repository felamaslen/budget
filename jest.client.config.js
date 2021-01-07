const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./src/client'],
  moduleNameMapper: {
    '\\.(jpg|png)': '<rootDir>/src/client/test-utils/file-loader.js',
    ...baseConfig.moduleNameMapper,
  },
  testMatch: ['**/*.spec.ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/client/test-utils/after-env.ts'],
  setupFiles: ['<rootDir>/src/client/test-utils/fetch.ts'],
  coverageDirectory: 'coverage/client',
  collectCoverageFrom: [
    'src/client/**/*.{ts,tsx}',
    '!node_modules/**',
    '!src/client/test-data/**',
    '!src/client/test-utils/**',
  ],
  snapshotSerializers: ['@emotion/jest/serializer'],
};
