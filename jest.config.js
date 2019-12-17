module.exports = {
  roots: ['./src'],
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  testRegex: '/__tests__/.*\\.spec\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '~/(.*)': '<rootDir>/src/$1',
  },
};
