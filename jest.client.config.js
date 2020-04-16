const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  roots: ['./web/src'],
  moduleNameMapper: {
    '~client/(.*)': '<rootDir>/web/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/web/src/test-after-env.ts'],
};
