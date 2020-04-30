const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./web/src'],
  moduleNameMapper: {
    '~client/(.*)': '<rootDir>/web/src/$1',
    '\\.(jpg|png)': '<rootDir>/web/src/mocks/file-loader.js',
  },
  setupFilesAfterEnv: ['<rootDir>/web/src/test-after-env.ts'],
};
