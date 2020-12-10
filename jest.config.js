const mapPaths = require('tsconfig-paths-jest');
const tsconfig = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  moduleNameMapper: mapPaths(tsconfig),
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverage: process.env.COVERAGE === 'true' || ['true', '1'].includes(process.env.CI),
};
