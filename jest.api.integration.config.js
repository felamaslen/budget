const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  testMatch: ['**/*.integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/api/src/test-utils/after-env.integration.ts'],
  testTimeout: 15000,
  coverageDirectory: 'coverage/api/integration',
  collectCoverageFrom: [
    'api/src/**/*.ts',
    '!api/src/**/*.spec.ts',
    '!api/src/test-utils/**',
    '!node_modules/**',
  ],
};
