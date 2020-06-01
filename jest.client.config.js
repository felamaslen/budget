const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./web/src'],
  moduleNameMapper: {
    '\\.(jpg|png)': '<rootDir>/web/src/mocks/file-loader.js',
    '~client/(.*)': '<rootDir>/web/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/web/src/test-after-env.ts'],
  coverageDirectory: 'coverage/web',
};
