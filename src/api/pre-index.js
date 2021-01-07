require('@babel/register')({
  extensions: ['.js', '.ts', '.tsx'],
});
require('tsconfig-paths/register');

const { run } = require('./index.ts');

run();
