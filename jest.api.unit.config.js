const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./src/api'],
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/api/test-utils/after-env.unit.ts'],
  coverageDirectory: 'coverage/api/unit',
  collectCoverageFrom: [
    'src/api/**/*.ts',
    '!node_modules/**',
    '!src/api/**/*.spec.ts',
    '!src/api/test-utils/**',
    '!src/api/seeds/**',
  ],
};
