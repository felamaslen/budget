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
  collectCoverage: ['true', '1'].includes(process.env.CI),
  collectCoverageFrom: [
    'web/src/**/*.{ts,tsx}',
    'api/src/**/*.ts',
    '!node_modules/**',
    '!web/src/test-data/**',
  ],
};
