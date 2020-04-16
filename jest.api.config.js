const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  moduleNameMapper: {
    '~api/(.*)': '<rootDir>/api/src/$1',
  },
  globalSetup: '<rootDir>/api/src/test-setup.ts',
  globalTeardown: '<rootDir>/api/src/test-teardown.ts',
};
