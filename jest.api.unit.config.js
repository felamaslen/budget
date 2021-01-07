const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['./src/api'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/api/test-utils/after-env.unit.ts'],
  coverageDirectory: 'coverage/api/unit',
  collectCoverageFrom: [
    'src/api/**/*.ts',
    '!src/api/**/*.spec.ts',
    '!src/api/test-utils/**',
    '!node_modules/**',
  ],
};
