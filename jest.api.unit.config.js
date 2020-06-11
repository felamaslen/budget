const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  roots: ['./api/src'],
  moduleNameMapper: {
    '~api/(.*)': '<rootDir>/api/src/$1',
  },
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'integration.spec.ts'],
  coverageDirectory: 'coverage/api/unit',
  collectCoverageFrom: ['api/src/**/*.ts', '!api/src/**/*.spec.ts', '!node_modules/**'],
};
