const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  testMatch: ['**/*.integration.spec.ts'],
  globalSetup: '<rootDir>/api/src/test-utils/test-setup.ts',
  globalTeardown: '<rootDir>/api/src/test-utils/test-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/api/src/test-utils/test-after-env.ts'],
  coverageDirectory: 'coverage/api/integration',
  collectCoverageFrom: [
    'api/src/**/*.ts',
    '!api/src/**/*.spec.ts',
    '!api/src/test-utils/**',
    '!node_modules/**',
  ],
};
