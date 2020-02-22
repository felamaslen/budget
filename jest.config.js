module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  roots: ['./api/src'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '~api/(.*)': '<rootDir>/api/src/$1',
    '~web/(.*)': '<rootDir>/web/src/$1',
  },
  globalSetup: '<rootDir>/api/src/test-setup.ts',
};