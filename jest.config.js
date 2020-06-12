const mapPaths = require('tsconfig-paths-jest');
const tsconfig = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  moduleNameMapper: mapPaths(tsconfig),
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverage: process.env.COVERAGE === 'true' || ['true', '1'].includes(process.env.CI),
};
