const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration.spec.ts'],
  coverageDirectory: 'coverage/api/unit',
  collectCoverageFrom: [
    'api/src/**/*.ts',
    '!api/src/**/*.spec.ts',
    '!api/src/test-utils/**',
    '!node_modules/**',
  ],
};
