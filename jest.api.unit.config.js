const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['./api/src'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/api/src/test-utils/after-env.unit.ts'],
  coverageDirectory: 'coverage/api/unit',
  collectCoverageFrom: [
    'api/src/**/*.ts',
    '!api/src/**/*.spec.ts',
    '!api/src/test-utils/**',
    '!node_modules/**',
  ],
};
