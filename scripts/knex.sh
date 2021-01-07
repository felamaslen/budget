#!/bin/sh

cd "$(dirname "$0")/.."

if test "$NODE_ENV" = 'production'; then
  ./node_modules/.bin/knex --knexfile lib/api/knexfile.js $@
else
  node -r tsconfig-paths/register ./node_modules/.bin/knex --knexfile src/api/knexfile.ts $@
fi

exit 0
