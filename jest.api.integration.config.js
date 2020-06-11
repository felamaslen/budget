const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  moduleNameMapper: {
    '~api/(.*)': '<rootDir>/api/src/$1',
  },
  testMatch: ['**/*.integration.spec.ts'],
  globalSetup: '<rootDir>/scripts/test-setup.ts',
  globalTeardown: '<rootDir>/scripts/test-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/scripts/test-after-env.ts'],
  coverageDirectory: 'coverage/api/integration',
  collectCoverageFrom: ['api/src/**/*.ts', '!api/src/**/*.spec.ts', '!node_modules/**'],
};
