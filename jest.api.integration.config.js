const apiUnitConfig = require('./jest.api.unit.config');
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./src/api'],
  testMatch: ['**/*.integration.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/api/test-utils/after-env.integration.ts'],
  testTimeout: 15000,
  coverageDirectory: 'coverage/api/integration',
  collectCoverageFrom: apiUnitConfig.collectCoverageFrom,
};
