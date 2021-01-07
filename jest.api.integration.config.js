const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['./src/api'],
  testMatch: ['**/*.integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/api/test-utils/after-env.integration.ts'],
  testTimeout: 15000,
  coverageDirectory: 'coverage/api/integration',
  collectCoverageFrom: [
    'src/api/**/*.ts',
    '!src/api/**/*.spec.ts',
    '!src/api/test-utils/**',
    '!node_modules/**',
  ],
};
