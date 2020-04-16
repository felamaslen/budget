module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['./api/src', './web/src'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '~api/(.*)': '<rootDir>/api/src/$1',
    '~client/(.*)': '<rootDir>/web/src/$1',
  },
  globalSetup: '<rootDir>/api/src/test-setup.ts',
  globalTeardown: '<rootDir>/api/src/test-teardown.ts',
};
