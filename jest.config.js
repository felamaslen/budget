module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      diagnostics: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverage: process.env.COVERAGE === 'true' || ['true', '1'].includes(process.env.CI),
};
