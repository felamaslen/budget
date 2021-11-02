const clientConfig = require('./jest.client.config');
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    '^file-loader': '<rootDir>/src/client/__mocks__/file-mock.js',
    '^worker-loader': '<rootDir>/src/client/__mocks__/worker-mock.js',
    ...baseConfig.moduleNameMapper,
  },
  roots: ['./src/client'],
  setupFilesAfterEnv: ['<rootDir>/src/client/test-utils/visual.after-env.ts'],
  snapshotSerializers: ['@emotion/jest/serializer'],
  testEnvironment: 'jsdom',
  testMatch: ['**/*.visual.ts?(x)'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/client/test-utils/file-transformer.js',
  },
  coverageDirectory: 'coverage/visual',
  collectCoverageFrom: clientConfig.collectCoverageFrom,
};
